import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import showToast from "../utils/toast";
import {
  Users,
  CreditCard,
  FileText,
  Shield,
  TrendingUp,
  Search,
  Edit,
  Eye,
  Coins,
  Activity,
  Crown,
  Download,
  ExternalLink,
  Settings,
  BarChart3,
  DollarSign,
  UserCheck,
  AlertTriangle,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown,
  Building2,
  Award,
  Database,
  Server,
  X,
  Package,
} from "lucide-react";
import apiService from "../services/api";
import useWalletStore from "../store/wallet";
import Header from "../components/Header";
import NavigationHeader from "../components/NavigationHeader";
import LoadingSpinner from "../components/LoadingSpinner";

const SuperAdminDashboard = () => {
  const { user, token } = useWalletStore();
  const navigate = useNavigate();
  const { tab: urlTab } = useParams();
  
  // Get active tab from URL or default to "overview"
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [issuers, setIssuers] = useState([]);
  const [holders, setHolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [creditDefaults, setCreditDefaults] = useState(null);
  const [defaultsForm, setDefaultsForm] = useState(null);
  const [defaultsLoading, setDefaultsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivityLogs, setUserActivityLogs] = useState([]);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditEditValue, setCreditEditValue] = useState("");
  const [creditEditReason, setCreditEditReason] = useState("");
  const [updatingCredits, setUpdatingCredits] = useState(false);
  const [packages, setPackages] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [pagination, setPagination] = useState({
    users: { page: 1, limit: 50, total: 0 },
    issuers: { page: 1, limit: 20, total: 0 },
    holders: { page: 1, limit: 20, total: 0 },
    documents: { page: 1, limit: 50, total: 0 },
    activity: { page: 1, limit: 50, total: 0 },
  });

  useEffect(() => {
    if (user?.role !== "SUPER_ADMIN") {
      return;
    }
    loadData();
  }, [activeTab, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") {
        const [statsRes, analyticsRes] = await Promise.all([
          apiService.getSuperAdminStats(),
          apiService.getSuperAdminAnalytics(),
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      } else if (activeTab === "revenue") {
        const revenueRes = await apiService.getSuperAdminRevenue();
        setRevenue(revenueRes.data);
      } else if (activeTab === "users") {
        const usersRes = await apiService.getSuperAdminUsers({
          page: pagination.users.page,
          limit: pagination.users.limit,
          role: roleFilter || undefined,
          search: searchTerm,
        });
        setAllUsers(usersRes.data.users);
        setPagination((prev) => ({
          ...prev,
          users: usersRes.data.pagination,
        }));
      } else if (activeTab === "issuers") {
        const issuersRes = await apiService.getSuperAdminIssuers({
          page: pagination.issuers.page,
          limit: pagination.issuers.limit,
          search: searchTerm,
        });
        setIssuers(issuersRes.data.issuers);
        setPagination((prev) => ({
          ...prev,
          issuers: issuersRes.data.pagination,
        }));
      } else if (activeTab === "holders") {
        const holdersRes = await apiService.getSuperAdminHolders({
          page: pagination.holders.page,
          limit: pagination.holders.limit,
          search: searchTerm,
        });
        setHolders(holdersRes.data.holders);
        setPagination((prev) => ({
          ...prev,
          holders: holdersRes.data.pagination,
        }));
      } else if (activeTab === "documents") {
        const docsRes = await apiService.getSuperAdminDocuments({
          page: pagination.documents.page,
          limit: pagination.documents.limit,
          search: searchTerm,
        });
        setDocuments(docsRes.data.documents);
        setPagination((prev) => ({
          ...prev,
          documents: docsRes.data.pagination,
        }));
      } else if (activeTab === "packages") {
        setLoading(true);
        const packagesRes = await apiService.getSuperAdminPackages();
        setPackages(packagesRes.data.packages);
        setLoading(false);
      } else if (activeTab === "credits") {
        setDefaultsLoading(true);
        const defaultsRes = await apiService.getCreditDefaults();
        const defaults = defaultsRes.data;
        setCreditDefaults(defaults);
        setDefaultsForm(defaults);
        setDefaultsLoading(false);
      }
    } catch (error) {
      console.error("Failed to load super admin data:", error);
      showToast.error("Failed to load data: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadUserActivity = async (userId) => {
    try {
      setLoading(true);
      const response = await apiService.getSuperAdminUserActivity(userId, {
        page: pagination.activity.page,
        limit: pagination.activity.limit,
      });
      setUserActivityLogs(response.data.logs);
      setPagination((prev) => ({
        ...prev,
        activity: response.data.pagination,
      }));
    } catch (error) {
      console.error("Failed to load user activity:", error);
      showToast.error("Failed to load activity logs: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserCredits = async (userId, currentCredits) => {
    setSelectedUser({ id: userId, currentCredits });
    setCreditEditValue(currentCredits.toString());
    setCreditEditReason("");
    setShowCreditModal(true);
  };

  const saveUserCredits = async () => {
    if (!selectedUser || !creditEditValue) return;
    
    const newCredits = parseInt(creditEditValue);
    if (isNaN(newCredits) || newCredits < 0) {
      showToast.warning("Please enter a valid credit amount");
      return;
    }

    try {
      setUpdatingCredits(true);
      await apiService.updateSuperAdminUserCredits(
        selectedUser.id,
        newCredits,
        creditEditReason || "Super admin adjustment"
      );
      showToast.success("User credits updated successfully");
      setShowCreditModal(false);
      setSelectedUser(null);
      setCreditEditValue("");
      setCreditEditReason("");
      // Reload data
      if (activeTab === "users") {
        loadData();
      }
    } catch (error) {
      console.error("Failed to update credits:", error);
      showToast.error("Failed to update credits: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdatingCredits(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "overview" && activeTab !== "credits" && activeTab !== "revenue") {
      loadData();
    }
  }, [searchTerm, roleFilter, pagination.users.page, pagination.issuers.page, pagination.holders.page, pagination.documents.page]);

  useEffect(() => {
    if (selectedUser && selectedUser.id && userActivityLogs.length === 0) {
      loadUserActivity(selectedUser.id);
    }
  }, [selectedUser]);

  const handleSavePackages = async () => {
    setPackagesLoading(true);
    try {
      await apiService.updateSuperAdminPackages(packages);
      showToast.success("Packages updated successfully");
      setEditingPackage(null);
    } catch (error) {
      console.error("Failed to update packages:", error);
      showToast.error(
        error.response?.data?.message || "Failed to update packages"
      );
    } finally {
      setPackagesLoading(false);
    }
  };

  const handleDefaultsChange = (path, value) => {
    setDefaultsForm((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      const segments = path.split(".");
      let cursor = updated;
      while (segments.length > 1) {
        const key = segments.shift();
        cursor[key] = { ...(cursor[key] || {}) };
        cursor = cursor[key];
      }
      cursor[segments[0]] = value;
      return updated;
    });
  };

  const handleDefaultsSave = async () => {
    if (!defaultsForm) return;
    try {
      setDefaultsLoading(true);
      const payload = {
        ...defaultsForm,
        newlyRegisteredUsers: Number(defaultsForm.newlyRegisteredUsers) || 0,
        PesoToCredits: {
          peso: Number(defaultsForm.PesoToCredits?.peso) || 1,
          credits: Number(defaultsForm.PesoToCredits?.credits) || 1,
        },
        transactionRates: {
          generatePDF: Number(defaultsForm.transactionRates?.generatePDF) || 0,
          uploadToBlockChain:
            Number(defaultsForm.transactionRates?.uploadToBlockChain) || 0,
          uploadToIPFS:
            Number(defaultsForm.transactionRates?.uploadToIPFS) || 0,
          validateCertificate:
            Number(defaultsForm.transactionRates?.validateCertificate) || 0,
        },
        promotions: {
          enabled: Boolean(defaultsForm.promotions?.enabled),
          bonusPercent: Number(defaultsForm.promotions?.bonusPercent) || 0,
          description: defaultsForm.promotions?.description || "",
        },
      };
      const res = await apiService.updateCreditDefaults(payload);
      setCreditDefaults(res.data);
      setDefaultsForm(res.data);
        showToast.success("Credit settings updated");
    } catch (error) {
      console.error("Failed to update credit defaults:", error);
      showToast.error(
        error.response?.data?.message || "Failed to update credit defaults"
      );
    } finally {
      setDefaultsLoading(false);
    }
  };

  if (user?.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23] flex items-center justify-center">
        <div className="text-center">
          <Crown size={64} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">
            Super admin privileges required
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Platform Overview", icon: BarChart3, url: "platform-overview" },
    { id: "revenue", label: "Revenue Analytics", icon: DollarSign, url: "revenue-analytics" },
    { id: "users", label: "All Users", icon: Users, url: "all-users" },
    { id: "issuers", label: "Issuers", icon: Building2, url: "issuers" },
    { id: "holders", label: "Holders", icon: Shield, url: "holders" },
    { id: "documents", label: "All Documents", icon: FileText, url: "all-documents" },
    { id: "packages", label: "Packages Config", icon: Package, url: "packages-config" },
    { id: "credits", label: "System Config", icon: Settings, url: "system-config" },
  ];

  // Update active tab when URL changes
  useEffect(() => {
    if (urlTab) {
      const tab = tabs.find(t => t.url === urlTab);
      if (tab && tab.id !== activeTab) {
        setActiveTab(tab.id);
      }
    } else {
      // Redirect to default tab if no tab in URL
      navigate("/super-admin/platform-overview", { replace: true });
    }
  }, [urlTab, navigate]);

  // Update URL when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      navigate(`/super-admin/${tab.url}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23]">
      <Header />
      <NavigationHeader title="Super Admin Dashboard" showBack={true} />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Crown Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
              <Crown size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">Complete platform control & analytics</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-8 border-b border-white/10 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  handleTabChange(tab.id);
                  setSearchTerm("");
                  setRoleFilter("");
                }}
                className={`px-6 py-3 flex items-center space-x-2 border-b-2 transition-all duration-300 ease-in-out whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-yellow-400 text-yellow-400"
                    : "border-transparent text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="relative">
              {/* Platform Overview Tab */}
              {activeTab === "overview" && stats && analytics && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="text-blue-400" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">
                            {stats.users.total}
                          </p>
                          <p className="text-xs text-gray-400">Total Users</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="text-purple-400" size={16} />
                        <span className="text-gray-400">{stats.users.issuers} Issuers</span>
                        <span className="text-gray-600">•</span>
                        <Shield className="text-green-400" size={16} />
                        <span className="text-gray-400">{stats.users.holders} Holders</span>
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <FileText className="text-green-400" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">
                            {stats.documents.total}
                          </p>
                          <p className="text-xs text-gray-400">Authenticated Files</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Database className="text-blue-400" size={16} />
                        <span className="text-gray-400">{stats.documents.batches} Batches</span>
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Coins className="text-yellow-400" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">
                            {stats.credits.totalInWallets.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">Total Credits in Wallets</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-green-400">+{stats.credits.totalPurchased.toLocaleString()}</span>
                          <p className="text-xs text-gray-500">Purchased</p>
                        </div>
                        <div>
                          <span className="text-red-400">-{stats.credits.totalUsed.toLocaleString()}</span>
                          <p className="text-xs text-gray-500">Used</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Activity className="text-purple-400" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">
                            {stats.transactions.total}
                          </p>
                          <p className="text-xs text-gray-400">Total Transactions</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        Platform activity
                      </div>
                    </div>
                  </div>

                  {/* Growth Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="text-green-400" size={20} />
                        User Growth (6 Months)
                      </h3>
                      {analytics.userGrowth && analytics.userGrowth.length > 0 ? (
                        <div className="space-y-2">
                          {analytics.userGrowth.map((month, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
                              <span className="text-gray-400 text-sm">
                                {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                              <div className="flex items-center gap-4">
                                <span className="text-white font-semibold">+{month.new_users}</span>
                                <span className="text-gray-500 text-xs">Total: {month.total_users}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No growth data available</p>
                      )}
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="text-blue-400" size={20} />
                        Document Growth (6 Months)
                      </h3>
                      {analytics.documentGrowth && analytics.documentGrowth.length > 0 ? (
                        <div className="space-y-2">
                          {analytics.documentGrowth.map((month, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
                              <span className="text-gray-400 text-sm">
                                {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-white font-semibold">+{month.new_documents}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No growth data available</p>
                      )}
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="text-yellow-400" size={20} />
                        Top Issuers
                      </h3>
                      {analytics.topIssuers && Array.isArray(analytics.topIssuers) && analytics.topIssuers.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.topIssuers.slice(0, 5).map((issuer, idx) => (
                            <div key={issuer.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{issuer.email}</p>
                                  <p className="text-gray-400 text-xs">@{issuer.username}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-bold">{issuer.documentsIssued}</p>
                                <p className="text-gray-400 text-xs">documents</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No issuer data available</p>
                      )}
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="text-purple-400" size={20} />
                        Top Features by Usage
                      </h3>
                      {analytics.topFeatures && analytics.topFeatures.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.topFeatures.map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div>
                                <p className="text-white font-medium capitalize">{feature.feature || 'Unknown'}</p>
                                <p className="text-gray-400 text-xs">{feature._count} transactions</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-bold">{Math.abs(feature._sum?.creditsChange || 0)}</p>
                                <p className="text-gray-400 text-xs">credits used</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No feature data available</p>
                      )}
                    </div>
                  </div>

                  {/* Top Users by Credits */}
                  {stats.credits.topUsers && stats.credits.topUsers.length > 0 && (
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Coins className="text-yellow-400" size={20} />
                        Top Users by Credits
                      </h3>
                      <div className="space-y-2">
                        {stats.credits.topUsers.map((wallet, idx) => (
                          <div
                            key={wallet.userId}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-white text-sm">{wallet.user?.email || "Unknown"}</p>
                                <p className="text-gray-400 text-xs">{wallet.user?.role || "USER"}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-yellow-400 font-bold">{wallet.credits}</p>
                              <p className="text-gray-400 text-xs">credits</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Activity className="text-blue-400" size={20} />
                      Recent Platform Activity
                    </h3>
                    <div className="space-y-2">
                      {stats.recentActivity && Array.isArray(stats.recentActivity) && stats.recentActivity.length > 0 ? (
                        stats.recentActivity.slice(0, 10).map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                          >
                            <div>
                              <p className="text-white text-sm">{log.action}</p>
                            <p className="text-gray-400 text-xs">
                              {log.user?.email || "System"} •{" "}
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                      ) : (
                        <p className="text-gray-400 text-sm">No recent activity</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Analytics Tab */}
              {activeTab === "revenue" && revenue && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <DollarSign className="text-green-400" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">
                            {revenue.purchases.totalCredits.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">Total Credits Purchased</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        {revenue.purchases.totalTransactions} transactions
                      </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Activity className="text-blue-400" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">
                            {revenue.usage.totalCredits.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">Total Credits Used</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        {revenue.usage.totalTransactions} transactions
                      </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Coins className="text-yellow-400" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">
                            {(revenue.purchases.totalCredits - revenue.usage.totalCredits).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">Net Credits</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        Remaining in system
                      </p>
                    </div>
                  </div>

                  {/* Revenue by Feature */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Purchases by Feature</h3>
                      {revenue.purchases.byFeature && revenue.purchases.byFeature.length > 0 ? (
                        <div className="space-y-3">
                          {revenue.purchases.byFeature.map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div>
                                <p className="text-white font-medium capitalize">{feature.feature || 'Unknown'}</p>
                                <p className="text-gray-400 text-xs">{feature._count || 0} purchases</p>
                              </div>
                              <p className="text-white font-bold">{feature._sum?.creditsChange || 0}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No purchase data by feature</p>
                      )}
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Usage by Feature</h3>
                      {revenue.usage.byFeature && revenue.usage.byFeature.length > 0 ? (
                        <div className="space-y-3">
                          {revenue.usage.byFeature.map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div>
                                <p className="text-white font-medium capitalize">{feature.feature || 'Unknown'}</p>
                                <p className="text-gray-400 text-xs">{feature._count || 0} uses</p>
                              </div>
                              <p className="text-white font-bold">{Math.abs(feature._sum?.creditsChange || 0)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No usage data by feature</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Purchases */}
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Credit Purchases</h3>
                    <div className="space-y-2">
                      {revenue.recentPurchases && revenue.recentPurchases.length > 0 ? (
                        revenue.recentPurchases.map((purchase) => (
                          <div
                            key={purchase.id}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                          >
                            <div>
                              <p className="text-white text-sm">
                                {purchase.user?.email || "Unknown User"}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {new Date(purchase.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 font-bold">+{purchase.creditsChange || 0}</p>
                              <p className="text-gray-400 text-xs">credits</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm">No recent purchases</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* All Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPagination((prev) => ({
                            ...prev,
                            users: { ...prev.users, page: 1 },
                          }));
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setPagination((prev) => ({
                          ...prev,
                          users: { ...prev.users, page: 1 },
                        }));
                      }}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      <option value="">All Roles</option>
                      <option value="USER">User</option>
                      <option value="ISSUER">Issuer</option>
                      <option value="VALIDATOR">Validator</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>

                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Credits
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {allUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-white/5">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white font-medium">
                                  {user.email}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  @{user.username}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.role === "SUPER_ADMIN" ? "bg-yellow-500/20 text-yellow-400" :
                                user.role === "ADMIN" ? "bg-purple-500/20 text-purple-400" :
                                user.role === "ISSUER" ? "bg-blue-500/20 text-blue-400" :
                                user.role === "VALIDATOR" ? "bg-green-500/20 text-green-400" :
                                "bg-gray-500/20 text-gray-400"
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold">
                                  {user.creditWallet?.credits || 0}
                                </span>
                                <button
                                  onClick={() => handleUpdateUserCredits(user.id, user.creditWallet?.credits || 0)}
                                  className="p-1 hover:bg-white/10 rounded transition-colors"
                                  title="Edit credits"
                                >
                                  <Edit size={14} className="text-yellow-400" />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-400">
                                <p>{user._count.documents} docs</p>
                                <p>{user._count.certificates} certs</p>
                                {user._count.issuedBatches > 0 && (
                                  <p>{user._count.issuedBatches} batches</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  loadUserActivity(user.id);
                                }}
                                className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                              >
                                <Activity size={14} />
                                View Activity
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {pagination.users.pages > 1 && (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            users: { ...prev.users, page: prev.users.page - 1 },
                          }))
                        }
                        disabled={pagination.users.page === 1}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-white">
                        Page {pagination.users.page} of {pagination.users.pages}
                      </span>
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            users: { ...prev.users, page: prev.users.page + 1 },
                          }))
                        }
                        disabled={pagination.users.page === pagination.users.pages}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Issuers Tab - Enhanced */}
              {activeTab === "issuers" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Search issuers..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPagination((prev) => ({
                            ...prev,
                            issuers: { ...prev.issuers, page: 1 },
                          }));
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Issuer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Documents Issued
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Batches
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Credits
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Last Activity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {issuers.map((issuer) => (
                          <tr key={issuer.id} className="hover:bg-white/5">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white font-medium">
                                  {issuer.email}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  @{issuer.username}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-white font-semibold">
                              {issuer.documentsIssued}
                            </td>
                            <td className="px-6 py-4 text-white">
                              {issuer._count.issuedBatches}
                            </td>
                            <td className="px-6 py-4 text-white">
                              {issuer.creditWallet?.credits || 0}
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              {new Date(issuer.lastActivity).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {pagination.issuers.pages > 1 && (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            issuers: { ...prev.issuers, page: prev.issuers.page - 1 },
                          }))
                        }
                        disabled={pagination.issuers.page === 1}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-white">
                        Page {pagination.issuers.page} of {pagination.issuers.pages}
                      </span>
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            issuers: { ...prev.issuers, page: prev.issuers.page + 1 },
                          }))
                        }
                        disabled={pagination.issuers.page === pagination.issuers.pages}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Holders Tab */}
              {activeTab === "holders" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Search holders..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPagination((prev) => ({
                            ...prev,
                            holders: { ...prev.holders, page: 1 },
                          }));
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Holder
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Certificates
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Issuers
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            First Certificate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Last Certificate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {holders.map((holder, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white font-medium">
                                  {holder.name}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {holder.email}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-white font-semibold">
                              {holder.certificateCount}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {holder.issuers && Array.isArray(holder.issuers) && holder.issuers.length > 0 ? (
                                  <>
                                    {holder.issuers.slice(0, 2).map((issuer, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                                      >
                                        {issuer}
                                      </span>
                                    ))}
                                    {holder.issuers.length > 2 && (
                                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                                        +{holder.issuers.length - 2}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-gray-400 text-xs">No issuers</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              {holder.firstCertificateDate
                                ? new Date(holder.firstCertificateDate).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              {holder.lastCertificateDate
                                ? new Date(holder.lastCertificateDate).toLocaleDateString()
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {pagination.holders.pages > 1 && (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            holders: { ...prev.holders, page: prev.holders.page - 1 },
                          }))
                        }
                        disabled={pagination.holders.page === 1}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-white">
                        Page {pagination.holders.page} of {pagination.holders.pages}
                      </span>
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            holders: { ...prev.holders, page: prev.holders.page + 1 },
                          }))
                        }
                        disabled={pagination.holders.page === pagination.holders.pages}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === "documents" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPagination((prev) => ({
                            ...prev,
                            documents: { ...prev.documents, page: 1 },
                          }));
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Document
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Holder
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Issuer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Issued
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-white/5">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white font-medium">
                                  {doc.title}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {doc.docId}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white text-sm">
                                  {doc.studentName}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {doc.identityEmail}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-white text-sm">
                              {doc.issuer}
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              {new Date(doc.issuedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <a
                                  href={doc.verifyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                  title="Verify"
                                >
                                  <Eye size={16} className="text-blue-400" />
                                </a>
                                <a
                                  href={doc.explorerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                  title="View on Explorer"
                                >
                                  <ExternalLink size={16} className="text-green-400" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {pagination.documents.pages > 1 && (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            documents: { ...prev.documents, page: prev.documents.page - 1 },
                          }))
                        }
                        disabled={pagination.documents.page === 1}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-white">
                        Page {pagination.documents.page} of {pagination.documents.pages}
                      </span>
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            documents: { ...prev.documents, page: prev.documents.page + 1 },
                          }))
                        }
                        disabled={pagination.documents.page === pagination.documents.pages}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* User Activity Logs Modal */}
              {selectedUser && selectedUser.id && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                          Activity Logs
                        </h2>
                        <p className="text-sm text-gray-400">
                          {selectedUser.email || selectedUser.username}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUser(null);
                          setUserActivityLogs([]);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <X size={24} className="text-gray-400 hover:text-white" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      {loading ? (
                        <div className="flex justify-center py-12">
                          <LoadingSpinner size="lg" />
                        </div>
                      ) : userActivityLogs.length === 0 ? (
                        <div className="text-center py-12">
                          <Activity size={48} className="text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400">No activity logs found</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userActivityLogs.map((log) => (
                            <div
                              key={log.id}
                              className="bg-white/5 border border-white/10 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="text-white font-medium">{log.action}</p>
                                  <p className="text-gray-400 text-sm mt-1">
                                    {log.resource && (
                                      <span className="text-blue-400">{log.resource}</span>
                                    )}
                                    {log.resourceId && (
                                      <span className="text-gray-500"> • ID: {log.resourceId}</span>
                                    )}
                                  </p>
                                </div>
                                <span className="text-gray-400 text-xs">
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {log.details && (
                                <div className="mt-2 p-2 bg-white/5 rounded text-xs text-gray-400">
                                  <pre className="whitespace-pre-wrap">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                      {pagination.activity.pages > 1 && (
                      <div className="flex justify-center gap-2 p-4 border-t border-white/10">
                        <button
                          onClick={() => {
                            setPagination((prev) => ({
                              ...prev,
                              activity: { ...prev.activity, page: prev.activity.page - 1 },
                            }));
                            setTimeout(() => loadUserActivity(selectedUser.id), 100);
                          }}
                          disabled={pagination.activity.page === 1}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-white">
                          Page {pagination.activity.page} of {pagination.activity.pages}
                        </span>
                        <button
                          onClick={() => {
                            setPagination((prev) => ({
                              ...prev,
                              activity: { ...prev.activity, page: prev.activity.page + 1 },
                            }));
                            setTimeout(() => loadUserActivity(selectedUser.id), 100);
                          }}
                          disabled={pagination.activity.page === pagination.activity.pages}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Credit Edit Modal */}
              {showCreditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md">
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                      <h2 className="text-2xl font-bold text-white">Update User Credits</h2>
                      <button
                        onClick={() => {
                          setShowCreditModal(false);
                          setSelectedUser(null);
                          setCreditEditValue("");
                          setCreditEditReason("");
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <X size={24} className="text-gray-400 hover:text-white" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">
                          Current Credits
                        </label>
                        <input
                          type="text"
                          value={selectedUser.currentCredits || 0}
                          disabled
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">
                          New Credits Amount
                        </label>
                        <input
                          type="number"
                          value={creditEditValue}
                          onChange={(e) => setCreditEditValue(e.target.value)}
                          min="0"
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                          placeholder="Enter new credit amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">
                          Reason (Optional)
                        </label>
                        <input
                          type="text"
                          value={creditEditReason}
                          onChange={(e) => setCreditEditReason(e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                          placeholder="Reason for credit adjustment"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={saveUserCredits}
                          disabled={updatingCredits}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-semibold disabled:opacity-50"
                        >
                          {updatingCredits ? "Updating..." : "Update Credits"}
                        </button>
                        <button
                          onClick={() => {
                            setShowCreditModal(false);
                            setSelectedUser(null);
                            setCreditEditValue("");
                            setCreditEditReason("");
                          }}
                          className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Packages Config Tab */}
              {activeTab === "packages" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {packagesLoading || !packages ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">
                          Credit Packages Configuration
                        </h2>
                        <button
                          onClick={() => {
                            const newPackage = {
                              id: `package_${Date.now()}`,
                              name: "New Package",
                              credits: 100,
                              price: 100,
                              priceUSD: 2,
                              description: "",
                              features: [],
                              popular: false,
                              discount: 0,
                            };
                            setPackages([...packages, newPackage]);
                            setEditingPackage(newPackage.id);
                          }}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Package size={18} />
                          Add Package
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className={`bg-white/5 backdrop-blur border rounded-2xl p-6 ${
                              pkg.popular
                                ? "border-yellow-400/50 bg-yellow-500/10"
                                : "border-white/10"
                            }`}
                          >
                            {pkg.popular && (
                              <div className="mb-3">
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">
                                  MOST POPULAR
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-white">
                                {editingPackage === pkg.id ? (
                                  <input
                                    type="text"
                                    value={pkg.name}
                                    onChange={(e) => {
                                      setPackages(
                                        packages.map((p) =>
                                          p.id === pkg.id
                                            ? { ...p, name: e.target.value }
                                            : p
                                        )
                                      );
                                    }}
                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full"
                                  />
                                ) : (
                                  pkg.name
                                )}
                              </h3>
                              {editingPackage === pkg.id ? (
                                <button
                                  onClick={() => {
                                    setEditingPackage(null);
                                    handleSavePackages();
                                  }}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingPackage(pkg.id)}
                                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                >
                                  <Edit size={16} className="text-gray-400" />
                                </button>
                              )}
                            </div>

                            {editingPackage === pkg.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs text-gray-400">
                                    Description
                                  </label>
                                  <input
                                    type="text"
                                    value={pkg.description || ""}
                                    onChange={(e) => {
                                      setPackages(
                                        packages.map((p) =>
                                          p.id === pkg.id
                                            ? { ...p, description: e.target.value }
                                            : p
                                        )
                                      );
                                    }}
                                    className="mt-1 w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-gray-400">
                                      Credits
                                    </label>
                                    <input
                                      type="number"
                                      value={pkg.credits || 0}
                                      onChange={(e) => {
                                        setPackages(
                                          packages.map((p) =>
                                            p.id === pkg.id
                                              ? { ...p, credits: Number(e.target.value) }
                                              : p
                                          )
                                        );
                                      }}
                                      className="mt-1 w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-400">
                                      Price (₱)
                                    </label>
                                    <input
                                      type="number"
                                      value={pkg.price || 0}
                                      onChange={(e) => {
                                        setPackages(
                                          packages.map((p) =>
                                            p.id === pkg.id
                                              ? { ...p, price: Number(e.target.value) }
                                              : p
                                          )
                                        );
                                      }}
                                      className="mt-1 w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-gray-400">
                                      Discount (%)
                                    </label>
                                    <input
                                      type="number"
                                      value={pkg.discount || 0}
                                      onChange={(e) => {
                                        setPackages(
                                          packages.map((p) =>
                                            p.id === pkg.id
                                              ? { ...p, discount: Number(e.target.value) }
                                              : p
                                          )
                                        );
                                      }}
                                      className="mt-1 w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <label className="flex items-center gap-2 text-xs text-gray-400">
                                      <input
                                        type="checkbox"
                                        checked={pkg.popular || false}
                                        onChange={(e) => {
                                          setPackages(
                                            packages.map((p) =>
                                              p.id === pkg.id
                                                ? { ...p, popular: e.target.checked }
                                                : p
                                            )
                                          );
                                        }}
                                        className="rounded"
                                      />
                                      Popular
                                    </label>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setPackages(packages.filter((p) => p.id !== pkg.id));
                                    if (editingPackage === pkg.id) {
                                      setEditingPackage(null);
                                    }
                                  }}
                                  className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
                                >
                                  Delete Package
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-gray-400 text-sm">
                                  {pkg.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-2xl font-bold text-white">
                                      {pkg.credits}
                                    </p>
                                    <p className="text-xs text-gray-400">credits</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-bold text-yellow-400">
                                      ₱{pkg.price}
                                    </p>
                                    {pkg.discount > 0 && (
                                      <p className="text-xs text-green-400">
                                        {pkg.discount}% off
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {packages.length > 0 && editingPackage === null && (
                        <div className="flex justify-end">
                          <button
                            onClick={handleSavePackages}
                            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-semibold"
                          >
                            Save All Packages
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Credits Config Tab */}
              {activeTab === "credits" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {defaultsLoading || !defaultsForm ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                          <Coins className="text-yellow-400" size={20} />
                          Registration & Purchase Configuration
                        </h3>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                          <p className="text-yellow-400 text-sm font-medium mb-2">Registration Bonus</p>
                          <div>
                            <label className="text-sm text-gray-300">
                              Free credits for new users
                            </label>
                            <input
                              type="number"
                              value={defaultsForm.newlyRegisteredUsers || 0}
                              onChange={(e) =>
                                handleDefaultsChange(
                                  "newlyRegisteredUsers",
                                  Number(e.target.value)
                                )
                              }
                              className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white p-3"
                              placeholder="e.g., 100"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              Credits automatically granted when a user registers
                            </p>
                          </div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                          <p className="text-green-400 text-sm font-medium mb-2">Purchase Conversion Rate</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-gray-300">
                                Philippine Peso (₱) amount
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={defaultsForm.PesoToCredits?.peso || 1}
                                onChange={(e) =>
                                  handleDefaultsChange(
                                    "PesoToCredits.peso",
                                    Number(e.target.value)
                                  )
                                }
                                className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white p-3"
                                placeholder="e.g., 1"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-300">
                                Credits received
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={defaultsForm.PesoToCredits?.credits || 1}
                                onChange={(e) =>
                                  handleDefaultsChange(
                                    "PesoToCredits.credits",
                                    Number(e.target.value)
                                  )
                                }
                                className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white p-3"
                                placeholder="e.g., 1"
                              />
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-white/5 rounded-lg">
                            <p className="text-sm text-gray-300">
                              <span className="font-semibold text-white">Current Rate:</span> ₱
                              {(defaultsForm.PesoToCredits?.peso || 1) /
                                (defaultsForm.PesoToCredits?.credits || 1)}
                              {" = 1 credit"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Example: ₱{(defaultsForm.PesoToCredits?.peso || 1) * 100} = {(defaultsForm.PesoToCredits?.credits || 1) * 100} credits
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-white text-lg font-semibold">
                          Transaction Rates
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-sm text-gray-400">
                              Generate PDF
                            </label>
                            <input
                              type="number"
                              value={defaultsForm.transactionRates?.generatePDF || 0}
                              onChange={(e) =>
                                handleDefaultsChange(
                                  "transactionRates.generatePDF",
                                  Number(e.target.value)
                                )
                              }
                              className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white p-3"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">
                              Upload to Blockchain
                            </label>
                            <input
                              type="number"
                              value={defaultsForm.transactionRates?.uploadToBlockChain || 0}
                              onChange={(e) =>
                                handleDefaultsChange(
                                  "transactionRates.uploadToBlockChain",
                                  Number(e.target.value)
                                )
                              }
                              className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white p-3"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">
                              Upload to IPFS
                            </label>
                            <input
                              type="number"
                              value={defaultsForm.transactionRates?.uploadToIPFS || 0}
                              onChange={(e) =>
                                handleDefaultsChange(
                                  "transactionRates.uploadToIPFS",
                                  Number(e.target.value)
                                )
                              }
                              className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white p-3"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">
                              Validate Certificate
                            </label>
                            <input
                              type="number"
                              value={defaultsForm.transactionRates?.validateCertificate || 0}
                              onChange={(e) =>
                                handleDefaultsChange(
                                  "transactionRates.validateCertificate",
                                  Number(e.target.value)
                                )
                              }
                              className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white p-3"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-white text-lg font-semibold">
                          Promotions
                        </h3>
                        <div className="flex items-center space-x-3">
                          <input
                            id="promoEnabled"
                            type="checkbox"
                            checked={defaultsForm.promotions?.enabled || false}
                            onChange={(e) =>
                              handleDefaultsChange(
                                "promotions.enabled",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-white/20 bg-white/10"
                          />
                          <label
                            htmlFor="promoEnabled"
                            className="text-sm text-gray-300"
                          >
                            Enable bonus credits
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-400">
                              Bonus percent
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={defaultsForm.promotions?.bonusPercent || 0}
                              onChange={(e) =>
                                handleDefaultsChange(
                                  "promotions.bonusPercent",
                                  Number(e.target.value)
                                )
                              }
                              className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white p-3"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">
                              Description
                            </label>
                            <input
                              type="text"
                              value={defaultsForm.promotions?.description || ""}
                              onChange={(e) =>
                                handleDefaultsChange(
                                  "promotions.description",
                                  e.target.value
                                )
                              }
                              className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-white p-3"
                              placeholder="e.g., Holiday promo"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleDefaultsSave}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold disabled:opacity-50"
                      disabled={defaultsLoading}
                    >
                      {defaultsLoading ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
