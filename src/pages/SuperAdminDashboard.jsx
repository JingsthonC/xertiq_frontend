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
  Lock,
  Clock,
  HelpCircle,
  Ticket,
  Plus,
  CheckCircle,
  MessageSquare,
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
  const [authConfig, setAuthConfig] = useState(null);
  const [authConfigForm, setAuthConfigForm] = useState(null);
  const [authConfigLoading, setAuthConfigLoading] = useState(false);
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
  const [pendingIssuers, setPendingIssuers] = useState([]);
  const [pendingIssuersCount, setPendingIssuersCount] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingUserId, setRejectingUserId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(null);
  // FAQ management state
  const [adminFaqs, setAdminFaqs] = useState([]);
  const [faqModal, setFaqModal] = useState(null); // null | 'create' | faqObject
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "", sortOrder: 0, isPublished: true });
  const [faqLoading, setFaqLoading] = useState(false);
  // Ticket management state
  const [adminTickets, setAdminTickets] = useState([]);
  const [ticketStatusFilter, setTicketStatusFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketUpdateForm, setTicketUpdateForm] = useState({ status: "", adminNotes: "", priority: "" });
  const [ticketLoading, setTicketLoading] = useState(false);
  const [pagination, setPagination] = useState({
    users: { page: 1, limit: 50, total: 0 },
    issuers: { page: 1, limit: 20, total: 0 },
    holders: { page: 1, limit: 20, total: 0 },
    documents: { page: 1, limit: 50, total: 0 },
    activity: { page: 1, limit: 50, total: 0 },
    tickets: { page: 1, limit: 20, total: 0 },
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
      // Always fetch pending issuers count for the badge
      try {
        const pendingRes = await apiService.getSuperAdminPendingIssuers({ limit: 1 });
        setPendingIssuersCount(pendingRes.data.pagination.total);
      } catch {
        // Non-critical, ignore
      }

      if (activeTab === "overview") {
        const [statsRes, analyticsRes] = await Promise.all([
          apiService.getSuperAdminStats(),
          apiService.getSuperAdminAnalytics(),
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      } else if (activeTab === "approvals") {
        const pendingRes = await apiService.getSuperAdminPendingIssuers();
        setPendingIssuers(pendingRes.data.issuers);
        setPendingIssuersCount(pendingRes.data.pagination.total);
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
        const [defaultsRes, authConfigRes] = await Promise.all([
          apiService.getCreditDefaults(),
          apiService.getSuperAdminAuthConfig(),
        ]);
        const defaults = defaultsRes.data;
        setCreditDefaults(defaults);
        setDefaultsForm(defaults);
        setAuthConfig(authConfigRes.data);
        setAuthConfigForm(authConfigRes.data);
        setDefaultsLoading(false);
      } else if (activeTab === "faqs") {
        setFaqLoading(true);
        const faqsRes = await apiService.getAdminFaqs();
        setAdminFaqs(faqsRes.data);
        setFaqLoading(false);
      } else if (activeTab === "tickets") {
        setTicketLoading(true);
        const ticketsRes = await apiService.getAdminTickets({
          page: pagination.tickets.page,
          limit: pagination.tickets.limit,
          status: ticketStatusFilter || undefined,
        });
        setAdminTickets(ticketsRes.data.tickets);
        setPagination((prev) => ({
          ...prev,
          tickets: ticketsRes.data.pagination,
        }));
        setTicketLoading(false);
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

  const handleAuthConfigSave = async () => {
    if (!authConfigForm) return;
    try {
      setAuthConfigLoading(true);
      const payload = {
        accessTokenExpiresInMinutes: Number(authConfigForm.accessTokenExpiresInMinutes),
        refreshTokenExpiresInHours: Number(authConfigForm.refreshTokenExpiresInHours),
      };
      const res = await apiService.updateSuperAdminAuthConfig(payload);
      setAuthConfig(res.data);
      setAuthConfigForm(res.data);
      showToast.success("Token settings updated. Applies to all new tokens immediately.");
    } catch (error) {
      showToast.error(error.response?.data?.error || "Failed to update token settings");
    } finally {
      setAuthConfigLoading(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Crown size={64} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1E40AF] mb-2">Access Denied</h2>
          <p className="text-slate-500">
            Super admin privileges required
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Platform Overview", icon: BarChart3, url: "platform-overview" },
    { id: "approvals", label: "Pending Approvals", icon: UserCheck, url: "pending-approvals" },
    { id: "revenue", label: "Revenue Analytics", icon: DollarSign, url: "revenue-analytics" },
    { id: "users", label: "All Users", icon: Users, url: "all-users" },
    { id: "issuers", label: "Issuers", icon: Building2, url: "issuers" },
    { id: "holders", label: "Holders", icon: Shield, url: "holders" },
    { id: "documents", label: "All Documents", icon: FileText, url: "all-documents" },
    { id: "packages", label: "Packages Config", icon: Package, url: "packages-config" },
    { id: "credits", label: "System Config", icon: Settings, url: "system-config" },
    { id: "faqs", label: "FAQ Management", icon: HelpCircle, url: "faq-management" },
    { id: "tickets", label: "Support Tickets", icon: Ticket, url: "support-tickets" },
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

  const handleApproveIssuer = async (userId) => {
    setApprovalLoading(userId);
    try {
      await apiService.approveSuperAdminIssuer(userId);
      showToast.success("Issuer approved successfully");
      setPendingIssuers((prev) => prev.filter((i) => i.id !== userId));
      setPendingIssuersCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      showToast.error("Failed to approve issuer: " + (error.response?.data?.error || error.message));
    } finally {
      setApprovalLoading(null);
    }
  };

  const handleRejectIssuer = async () => {
    if (!rejectReason.trim()) {
      showToast.warning("Please provide a rejection reason");
      return;
    }
    setApprovalLoading(rejectingUserId);
    try {
      await apiService.rejectSuperAdminIssuer(rejectingUserId, rejectReason.trim());
      showToast.success("Issuer rejected");
      setPendingIssuers((prev) => prev.filter((i) => i.id !== rejectingUserId));
      setPendingIssuersCount((prev) => Math.max(0, prev - 1));
      setShowRejectModal(false);
      setRejectingUserId(null);
      setRejectReason("");
    } catch (error) {
      showToast.error("Failed to reject issuer: " + (error.response?.data?.error || error.message));
    } finally {
      setApprovalLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header />
      <NavigationHeader title="Super Admin Dashboard" showBack={true} />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Crown Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl shadow-lg">
              <Crown size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1E40AF]">Super Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">Complete platform control & analytics</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-8 border-b border-slate-200 overflow-x-auto">
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
                    ? "border-[#3B82F6] text-[#3B82F6]"
                    : "border-transparent text-slate-500 hover:text-[#1E40AF] hover:border-[#3B82F6]"
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                {tab.id === "approvals" && pendingIssuersCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingIssuersCount}
                  </span>
                )}
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
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="text-[#3B82F6]" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-[#1E40AF]">
                            {stats.users.total}
                          </p>
                          <p className="text-xs text-slate-500">Total Users</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="text-[#8B5CF6]" size={16} />
                        <span className="text-slate-500">{stats.users.issuers} Issuers</span>
                        <span className="text-slate-400">•</span>
                        <Shield className="text-green-400" size={16} />
                        <span className="text-slate-500">{stats.users.holders} Holders</span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <FileText className="text-green-400" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-[#1E40AF]">
                            {stats.documents.total}
                          </p>
                          <p className="text-xs text-slate-500">Authenticated Files</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Database className="text-[#3B82F6]" size={16} />
                        <span className="text-slate-500">{stats.documents.batches} Batches</span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Coins className="text-[#8B5CF6]" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-[#1E40AF]">
                            {stats.credits.totalInWallets.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">Total Credits in Wallets</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-green-400">+{stats.credits.totalPurchased.toLocaleString()}</span>
                          <p className="text-xs text-slate-400">Purchased</p>
                        </div>
                        <div>
                          <span className="text-red-400">-{stats.credits.totalUsed.toLocaleString()}</span>
                          <p className="text-xs text-slate-400">Used</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Activity className="text-[#8B5CF6]" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-[#1E40AF]">
                            {stats.transactions.total}
                          </p>
                          <p className="text-xs text-slate-500">Total Transactions</p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        Platform activity
                      </div>
                    </div>
                  </div>

                  {/* Growth Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-[#1E40AF] mb-4 flex items-center gap-2">
                        <TrendingUp className="text-green-400" size={20} />
                        User Growth (6 Months)
                      </h3>
                      {analytics.userGrowth && analytics.userGrowth.length > 0 ? (
                        <div className="space-y-2">
                          {analytics.userGrowth.map((month, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <span className="text-slate-500 text-sm">
                                {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                              <div className="flex items-center gap-4">
                                <span className="text-[#1E40AF] font-semibold">+{month.new_users}</span>
                                <span className="text-slate-400 text-xs">Total: {month.total_users}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No growth data available</p>
                      )}
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-[#1E40AF] mb-4 flex items-center gap-2">
                        <FileText className="text-[#3B82F6]" size={20} />
                        Document Growth (6 Months)
                      </h3>
                      {analytics.documentGrowth && analytics.documentGrowth.length > 0 ? (
                        <div className="space-y-2">
                          {analytics.documentGrowth.map((month, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <span className="text-slate-500 text-sm">
                                {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-[#1E40AF] font-semibold">+{month.new_documents}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No growth data available</p>
                      )}
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-[#1E40AF] mb-4 flex items-center gap-2">
                        <Award className="text-[#8B5CF6]" size={20} />
                        Top Issuers
                      </h3>
                      {analytics.topIssuers && Array.isArray(analytics.topIssuers) && analytics.topIssuers.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.topIssuers.slice(0, 5).map((issuer, idx) => (
                            <div key={issuer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-[#1E40AF] font-bold text-sm">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="text-[#1E40AF] font-medium">{issuer.email}</p>
                                  <p className="text-slate-500 text-xs">@{issuer.username}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[#1E40AF] font-bold">{issuer.documentsIssued}</p>
                                <p className="text-slate-500 text-xs">documents</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No issuer data available</p>
                      )}
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-[#1E40AF] mb-4 flex items-center gap-2">
                        <Activity className="text-[#8B5CF6]" size={20} />
                        Top Features by Usage
                      </h3>
                      {analytics.topFeatures && analytics.topFeatures.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.topFeatures.map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div>
                                <p className="text-[#1E40AF] font-medium capitalize">{feature.feature || 'Unknown'}</p>
                                <p className="text-slate-500 text-xs">{feature._count} transactions</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[#1E40AF] font-bold">{Math.abs(feature._sum?.creditsChange || 0)}</p>
                                <p className="text-slate-500 text-xs">credits used</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No feature data available</p>
                      )}
                    </div>
                  </div>

                  {/* Top Users by Credits */}
                  {stats.credits.topUsers && stats.credits.topUsers.length > 0 && (
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-[#1E40AF] mb-4 flex items-center gap-2">
                        <Coins className="text-[#8B5CF6]" size={20} />
                        Top Users by Credits
                      </h3>
                      <div className="space-y-2">
                        {stats.credits.topUsers.map((wallet, idx) => (
                          <div
                            key={wallet.userId}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-[#1E40AF] font-bold text-sm">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-[#1E40AF] text-sm">{wallet.user?.email || "Unknown"}</p>
                                <p className="text-slate-500 text-xs">{wallet.user?.role || "USER"}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[#8B5CF6] font-bold">{wallet.credits}</p>
                              <p className="text-slate-500 text-xs">credits</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-[#1E40AF] mb-4 flex items-center gap-2">
                      <Activity className="text-[#3B82F6]" size={20} />
                      Recent Platform Activity
                    </h3>
                    <div className="space-y-2">
                      {stats.recentActivity && Array.isArray(stats.recentActivity) && stats.recentActivity.length > 0 ? (
                        stats.recentActivity.slice(0, 10).map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div>
                              <p className="text-[#1E40AF] text-sm">{log.action}</p>
                            <p className="text-slate-500 text-xs">
                              {log.user?.email || "System"} •{" "}
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                      ) : (
                        <p className="text-slate-500 text-sm">No recent activity</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Approvals Tab */}
              {activeTab === "approvals" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-semibold text-slate-800">Pending Issuer Approvals</h2>
                  {pendingIssuers.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                      <UserCheck size={48} className="mx-auto text-green-400 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700">No Pending Approvals</h3>
                      <p className="text-slate-500 mt-1">All issuer applications have been reviewed.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="text-left p-4 text-sm font-semibold text-slate-600">Name</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-600">Email</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-600">Organization</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-600">Registered</th>
                            <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pendingIssuers.map((issuer) => (
                            <tr key={issuer.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 text-sm text-slate-800 font-medium">
                                {issuer.firstName} {issuer.lastName}
                              </td>
                              <td className="p-4 text-sm text-slate-600">{issuer.email}</td>
                              <td className="p-4 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                  <Building2 size={14} className="text-slate-400" />
                                  {issuer.organizationName || "N/A"}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-slate-500">
                                {new Date(issuer.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => handleApproveIssuer(issuer.id)}
                                  disabled={approvalLoading === issuer.id}
                                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {approvalLoading === issuer.id ? "..." : "Approve"}
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingUserId(issuer.id);
                                    setRejectReason("");
                                    setShowRejectModal(true);
                                  }}
                                  disabled={approvalLoading === issuer.id}
                                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Revenue Analytics Tab */}
              {activeTab === "revenue" && revenue && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <DollarSign className="text-green-400" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-[#1E40AF]">
                            {revenue.purchases.totalCredits.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">Total Credits Purchased</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        {revenue.purchases.totalTransactions} transactions
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Activity className="text-[#3B82F6]" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-[#1E40AF]">
                            {revenue.usage.totalCredits.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">Total Credits Used</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        {revenue.usage.totalTransactions} transactions
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Coins className="text-[#8B5CF6]" size={32} />
                        <div className="text-right">
                          <p className="text-3xl font-bold text-[#1E40AF]">
                            {(revenue.purchases.totalCredits - revenue.usage.totalCredits).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">Net Credits</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        Remaining in system
                      </p>
                    </div>
                  </div>

                  {/* Revenue by Feature */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-[#1E40AF] mb-4">Purchases by Feature</h3>
                      {revenue.purchases.byFeature && revenue.purchases.byFeature.length > 0 ? (
                        <div className="space-y-3">
                          {revenue.purchases.byFeature.map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div>
                                <p className="text-[#1E40AF] font-medium capitalize">{feature.feature || 'Unknown'}</p>
                                <p className="text-slate-500 text-xs">{feature._count || 0} purchases</p>
                              </div>
                              <p className="text-[#1E40AF] font-bold">{feature._sum?.creditsChange || 0}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No purchase data by feature</p>
                      )}
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-[#1E40AF] mb-4">Usage by Feature</h3>
                      {revenue.usage.byFeature && revenue.usage.byFeature.length > 0 ? (
                        <div className="space-y-3">
                          {revenue.usage.byFeature.map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div>
                                <p className="text-[#1E40AF] font-medium capitalize">{feature.feature || 'Unknown'}</p>
                                <p className="text-slate-500 text-xs">{feature._count || 0} uses</p>
                              </div>
                              <p className="text-[#1E40AF] font-bold">{Math.abs(feature._sum?.creditsChange || 0)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No usage data by feature</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Purchases */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-[#1E40AF] mb-4">Recent Credit Purchases</h3>
                    <div className="space-y-2">
                      {revenue.recentPurchases && revenue.recentPurchases.length > 0 ? (
                        revenue.recentPurchases.map((purchase) => (
                          <div
                            key={purchase.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div>
                              <p className="text-[#1E40AF] text-sm">
                                {purchase.user?.email || "Unknown User"}
                              </p>
                              <p className="text-slate-500 text-xs">
                                {new Date(purchase.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 font-bold">+{purchase.creditsChange || 0}</p>
                              <p className="text-slate-500 text-xs">credits</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">No recent purchases</p>
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
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
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
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] placeholder-gray-400 focus:outline-none focus:border-yellow-400"
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
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF]"
                    >
                      <option value="">All Roles</option>
                      <option value="USER">User</option>
                      <option value="ISSUER">Issuer</option>
                      <option value="VALIDATOR">Validator</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>

                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
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
                          <tr key={user.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-[#1E40AF] font-medium">
                                  {user.email}
                                </p>
                                <p className="text-slate-500 text-sm">
                                  @{user.username}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.role === "SUPER_ADMIN" ? "bg-yellow-500/20 text-[#8B5CF6]" :
                                user.role === "ADMIN" ? "bg-purple-500/20 text-[#8B5CF6]" :
                                user.role === "ISSUER" ? "bg-blue-500/20 text-[#3B82F6]" :
                                user.role === "VALIDATOR" ? "bg-green-500/20 text-green-400" :
                                "bg-gray-500/20 text-slate-500"
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[#1E40AF] font-semibold">
                                  {user.creditWallet?.credits || 0}
                                </span>
                                <button
                                  onClick={() => handleUpdateUserCredits(user.id, user.creditWallet?.credits || 0)}
                                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                                  title="Edit credits"
                                >
                                  <Edit size={14} className="text-[#8B5CF6]" />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-500">
                                <p>{user._count.documents} docs</p>
                                <p>{user._count.certificates} certs</p>
                                {user._count.issuedBatches > 0 && (
                                  <p>{user._count.issuedBatches} batches</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  loadUserActivity(user.id);
                                }}
                                className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-[#3B82F6] rounded-lg text-sm transition-colors flex items-center gap-1"
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
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-[#1E40AF]">
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
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] disabled:opacity-50"
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
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
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
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
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
                          <tr key={issuer.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-[#1E40AF] font-medium">
                                  {issuer.email}
                                </p>
                                <p className="text-slate-500 text-sm">
                                  @{issuer.username}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[#1E40AF] font-semibold">
                              {issuer.documentsIssued}
                            </td>
                            <td className="px-6 py-4 text-[#1E40AF]">
                              {issuer._count.issuedBatches}
                            </td>
                            <td className="px-6 py-4 text-[#1E40AF]">
                              {issuer.creditWallet?.credits || 0}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
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
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-[#1E40AF]">
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
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] disabled:opacity-50"
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
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
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
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
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
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-[#1E40AF] font-medium">
                                  {holder.name}
                                </p>
                                <p className="text-slate-500 text-sm">
                                  {holder.email}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[#1E40AF] font-semibold">
                              {holder.certificateCount}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {holder.issuers && Array.isArray(holder.issuers) && holder.issuers.length > 0 ? (
                                  <>
                                    {holder.issuers.slice(0, 2).map((issuer, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 bg-blue-500/20 text-[#3B82F6] rounded text-xs"
                                      >
                                        {issuer}
                                      </span>
                                    ))}
                                    {holder.issuers.length > 2 && (
                                      <span className="px-2 py-1 bg-gray-500/20 text-slate-500 rounded text-xs">
                                        +{holder.issuers.length - 2}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-500 text-xs">No issuers</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                              {holder.firstCertificateDate
                                ? new Date(holder.firstCertificateDate).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
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
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-[#1E40AF]">
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
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] disabled:opacity-50"
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
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
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
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
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
                          <tr key={doc.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-[#1E40AF] font-medium">
                                  {doc.title}
                                </p>
                                <p className="text-slate-500 text-xs">
                                  {doc.docId}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-[#1E40AF] text-sm">
                                  {doc.studentName}
                                </p>
                                <p className="text-slate-500 text-xs">
                                  {doc.identityEmail}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[#1E40AF] text-sm">
                              {doc.issuer}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                              {new Date(doc.issuedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <a
                                  href={doc.verifyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                  title="Verify"
                                >
                                  <Eye size={16} className="text-[#3B82F6]" />
                                </a>
                                <a
                                  href={doc.explorerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
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
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-[#1E40AF]">
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
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] disabled:opacity-50"
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
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1E40AF] mb-1">
                          Activity Logs
                        </h2>
                        <p className="text-sm text-slate-500">
                          {selectedUser.email || selectedUser.username}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUser(null);
                          setUserActivityLogs([]);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X size={24} className="text-slate-500 hover:text-[#1E40AF]" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      {loading ? (
                        <div className="flex justify-center py-12">
                          <LoadingSpinner size="lg" />
                        </div>
                      ) : userActivityLogs.length === 0 ? (
                        <div className="text-center py-12">
                          <Activity size={48} className="text-slate-400 mx-auto mb-3" />
                          <p className="text-slate-500">No activity logs found</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userActivityLogs.map((log) => (
                            <div
                              key={log.id}
                              className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="text-[#1E40AF] font-medium">{log.action}</p>
                                  <p className="text-slate-500 text-sm mt-1">
                                    {log.resource && (
                                      <span className="text-[#3B82F6]">{log.resource}</span>
                                    )}
                                    {log.resourceId && (
                                      <span className="text-slate-400"> • ID: {log.resourceId}</span>
                                    )}
                                  </p>
                                </div>
                                <span className="text-slate-500 text-xs">
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {log.details && (
                                <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-500">
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
                      <div className="flex justify-center gap-2 p-4 border-t border-slate-200">
                        <button
                          onClick={() => {
                            setPagination((prev) => ({
                              ...prev,
                              activity: { ...prev.activity, page: prev.activity.page - 1 },
                            }));
                            setTimeout(() => loadUserActivity(selectedUser.id), 100);
                          }}
                          disabled={pagination.activity.page === 1}
                          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-[#1E40AF]">
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
                          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] disabled:opacity-50"
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
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                      <h2 className="text-2xl font-bold text-[#1E40AF]">Update User Credits</h2>
                      <button
                        onClick={() => {
                          setShowCreditModal(false);
                          setSelectedUser(null);
                          setCreditEditValue("");
                          setCreditEditReason("");
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X size={24} className="text-slate-500 hover:text-[#1E40AF]" />
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
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF]"
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
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] focus:outline-none focus:border-yellow-400"
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
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1E40AF] focus:outline-none focus:border-yellow-400"
                          placeholder="Reason for credit adjustment"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={saveUserCredits}
                          disabled={updatingCredits}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-[#1E40AF] rounded-lg font-semibold disabled:opacity-50"
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
                          className="px-4 py-2 bg-slate-50 border border-slate-200 text-[#1E40AF] rounded-lg"
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
                        <h2 className="text-2xl font-bold text-[#1E40AF]">
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
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-[#1E40AF] rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Package size={18} />
                          Add Package
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className={`bg-slate-50 backdrop-blur border rounded-2xl p-6 ${
                              pkg.popular
                                ? "border-yellow-400/50 bg-yellow-500/10"
                                : "border-slate-200"
                            }`}
                          >
                            {pkg.popular && (
                              <div className="mb-3">
                                <span className="px-2 py-1 bg-yellow-500/20 text-[#8B5CF6] rounded text-xs font-semibold">
                                  MOST POPULAR
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-[#1E40AF]">
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
                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-[#1E40AF] w-full"
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
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-[#1E40AF] rounded text-sm"
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingPackage(pkg.id)}
                                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                >
                                  <Edit size={16} className="text-slate-500" />
                                </button>
                              )}
                            </div>

                            {editingPackage === pkg.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs text-slate-500">
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
                                    className="mt-1 w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-[#1E40AF] text-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-slate-500">
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
                                      className="mt-1 w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-[#1E40AF] text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-500">
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
                                      className="mt-1 w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-[#1E40AF] text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-slate-500">
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
                                      className="mt-1 w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-[#1E40AF] text-sm"
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <label className="flex items-center gap-2 text-xs text-slate-500">
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
                                <p className="text-slate-500 text-sm">
                                  {pkg.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-2xl font-bold text-[#1E40AF]">
                                      {pkg.credits}
                                    </p>
                                    <p className="text-xs text-slate-500">credits</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-bold text-[#8B5CF6]">
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
                            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-[#1E40AF] rounded-lg transition-colors font-semibold"
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
                      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
                        <h3 className="text-[#1E40AF] text-lg font-semibold flex items-center gap-2">
                          <Coins className="text-[#8B5CF6]" size={20} />
                          Registration & Purchase Configuration
                        </h3>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                          <p className="text-[#8B5CF6] text-sm font-medium mb-2">Registration Bonus</p>
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
                              className="mt-1 w-full rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] p-3"
                              placeholder="e.g., 100"
                            />
                            <p className="text-xs text-slate-500 mt-1">
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
                                className="mt-1 w-full rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] p-3"
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
                                className="mt-1 w-full rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] p-3"
                                placeholder="e.g., 1"
                              />
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-gray-300">
                              <span className="font-semibold text-[#1E40AF]">Current Rate:</span> ₱
                              {(defaultsForm.PesoToCredits?.peso || 1) /
                                (defaultsForm.PesoToCredits?.credits || 1)}
                              {" = 1 credit"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Example: ₱{(defaultsForm.PesoToCredits?.peso || 1) * 100} = {(defaultsForm.PesoToCredits?.credits || 1) * 100} credits
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
                        <h3 className="text-[#1E40AF] text-lg font-semibold">
                          Transaction Rates
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-sm text-slate-500">
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
                              className="mt-1 w-full rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] p-3"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-slate-500">
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
                              className="mt-1 w-full rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] p-3"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-slate-500">
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
                              className="mt-1 w-full rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] p-3"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-slate-500">
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
                              className="mt-1 w-full rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] p-3"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
                        <h3 className="text-[#1E40AF] text-lg font-semibold">
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
                            <label className="text-sm text-slate-500">
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
                              className="mt-1 w-full rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] p-3"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-slate-500">
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
                              className="mt-1 w-full rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] p-3"
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
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-[#1E40AF] font-semibold disabled:opacity-50"
                      disabled={defaultsLoading}
                    >
                      {defaultsLoading ? "Saving..." : "Save Settings"}
                    </button>
                  </div>

                  {/* Token Security Configuration */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Lock size={20} className="text-[#1E40AF]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Token Security</h3>
                        <p className="text-sm text-slate-500">Control how long JWT access tokens and refresh tokens remain valid. Changes apply to all new tokens immediately — existing tokens keep their original expiry.</p>
                      </div>
                    </div>

                    {authConfigLoading || !authConfigForm ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="md" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Access Token */}
                        <div className="bg-slate-50 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock size={16} className="text-[#3B82F6]" />
                            <label className="text-sm font-semibold text-slate-700">Access Token Lifetime</label>
                          </div>
                          <p className="text-xs text-slate-500 mb-3">How long a JWT access token is valid after login or refresh. Shorter = more secure.</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={authConfigForm.accessTokenExpiresInMinutes || 60}
                              onChange={(e) => setAuthConfigForm((f) => ({ ...f, accessTokenExpiresInMinutes: Number(e.target.value) }))}
                              className="w-24 rounded-lg bg-white border border-slate-200 text-[#1E40AF] p-2 text-center font-semibold"
                            />
                            <span className="text-sm text-slate-500">minutes</span>
                            <span className="ml-auto text-xs text-slate-400 italic">
                              ({authConfigForm.accessTokenExpiresInMinutes >= 60
                                ? `${(authConfigForm.accessTokenExpiresInMinutes / 60).toFixed(1)}h`
                                : `${authConfigForm.accessTokenExpiresInMinutes}m`})
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">Range: 1 – 1440 min (1 day max)</p>
                        </div>

                        {/* Refresh Token */}
                        <div className="bg-slate-50 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock size={16} className="text-[#3B82F6]" />
                            <label className="text-sm font-semibold text-slate-700">Refresh Token Lifetime</label>
                          </div>
                          <p className="text-xs text-slate-500 mb-3">How long a refresh token is valid before the user must log in again. Tokens rotate on each use.</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="168"
                              value={authConfigForm.refreshTokenExpiresInHours || 24}
                              onChange={(e) => setAuthConfigForm((f) => ({ ...f, refreshTokenExpiresInHours: Number(e.target.value) }))}
                              className="w-24 rounded-lg bg-white border border-slate-200 text-[#1E40AF] p-2 text-center font-semibold"
                            />
                            <span className="text-sm text-slate-500">hours</span>
                            <span className="ml-auto text-xs text-slate-400 italic">
                              ({authConfigForm.refreshTokenExpiresInHours >= 24
                                ? `${(authConfigForm.refreshTokenExpiresInHours / 24).toFixed(1)} day(s)`
                                : `${authConfigForm.refreshTokenExpiresInHours}h`})
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">Range: 1 – 168 h (7 days max)</p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end mt-5">
                      <button
                        onClick={handleAuthConfigSave}
                        disabled={authConfigLoading || !authConfigForm}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold disabled:opacity-50"
                      >
                        {authConfigLoading ? "Saving..." : "Save Token Settings"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FAQ Management Tab */}
          {activeTab === "faqs" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800">FAQ Management</h2>
                <button
                  onClick={() => {
                    setFaqForm({ question: "", answer: "", category: "", sortOrder: 0, isPublished: true });
                    setFaqModal("create");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={16} /> Add FAQ
                </button>
              </div>

              {faqLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : adminFaqs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <HelpCircle size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No FAQs yet. Create your first one!</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Question</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Order</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Published</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminFaqs.map((faq) => (
                        <tr key={faq.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{faq.question}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{faq.category}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 text-center">{faq.sortOrder}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={async () => {
                                try {
                                  await apiService.updateFaq(faq.id, { isPublished: !faq.isPublished });
                                  setAdminFaqs((prev) => prev.map((f) => f.id === faq.id ? { ...f, isPublished: !f.isPublished } : f));
                                } catch {
                                  showToast.error("Failed to toggle FAQ");
                                }
                              }}
                              className={`text-xs px-2 py-1 rounded-full font-medium ${faq.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                            >
                              {faq.isPublished ? "Published" : "Draft"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setFaqForm({
                                  question: faq.question,
                                  answer: faq.answer,
                                  category: faq.category,
                                  sortOrder: faq.sortOrder,
                                  isPublished: faq.isPublished,
                                });
                                setFaqModal(faq);
                              }}
                              className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm("Delete this FAQ?")) return;
                                try {
                                  await apiService.deleteFaq(faq.id);
                                  setAdminFaqs((prev) => prev.filter((f) => f.id !== faq.id));
                                  showToast.success("FAQ deleted");
                                } catch {
                                  showToast.error("Failed to delete FAQ");
                                }
                              }}
                              className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Support Tickets Tab */}
          {activeTab === "tickets" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800">Support Tickets</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => {
                      setTicketStatusFilter(e.target.value);
                      setTimeout(() => loadData(), 0);
                    }}
                    className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              {ticketLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : adminTickets.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Ticket size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No tickets found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket);
                        setTicketUpdateForm({
                          status: ticket.status,
                          adminNotes: ticket.adminNotes || "",
                          priority: ticket.priority,
                        });
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-slate-800">{ticket.subject}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              ticket.status === "OPEN" ? "bg-green-100 text-green-700" :
                              ticket.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                              ticket.status === "RESOLVED" ? "bg-blue-100 text-blue-700" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {ticket.status.replace("_", " ")}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              ticket.priority === "URGENT" ? "bg-red-100 text-red-600" :
                              ticket.priority === "HIGH" ? "bg-orange-100 text-orange-600" :
                              ticket.priority === "MEDIUM" ? "bg-blue-100 text-blue-600" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-1">
                            By: {ticket.user?.email || "Unknown"} | {new Date(ticket.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                        </div>
                      </div>

                      {/* Expanded ticket detail */}
                      {selectedTicket?.id === ticket.id && (
                        <div
                          className="mt-4 pt-4 border-t border-slate-200 space-y-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3">
                            {ticket.description}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                              <select
                                value={ticketUpdateForm.status}
                                onChange={(e) => setTicketUpdateForm({ ...ticketUpdateForm, status: e.target.value })}
                                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                              >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
                              <select
                                value={ticketUpdateForm.priority}
                                onChange={(e) => setTicketUpdateForm({ ...ticketUpdateForm, priority: e.target.value })}
                                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Admin Notes</label>
                            <textarea
                              value={ticketUpdateForm.adminNotes}
                              onChange={(e) => setTicketUpdateForm({ ...ticketUpdateForm, adminNotes: e.target.value })}
                              rows={3}
                              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                              placeholder="Internal notes..."
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await apiService.updateTicket(ticket.id, ticketUpdateForm);
                                  setAdminTickets((prev) =>
                                    prev.map((t) => (t.id === ticket.id ? res.data : t))
                                  );
                                  setSelectedTicket(null);
                                  showToast.success("Ticket updated");
                                } catch {
                                  showToast.error("Failed to update ticket");
                                }
                              }}
                              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Update Ticket
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pagination */}
                  {pagination.tickets.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {Array.from({ length: pagination.tickets.totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPagination((prev) => ({
                              ...prev,
                              tickets: { ...prev.tickets, page: i + 1 },
                            }));
                            loadData();
                          }}
                          className={`px-3 py-1 text-sm rounded ${
                            pagination.tickets.page === i + 1
                              ? "bg-blue-500 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FAQ Create/Edit Modal */}
      {faqModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {faqModal === "create" ? "Create FAQ" : "Edit FAQ"}
              </h3>
              <button onClick={() => setFaqModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Question</label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="Enter the question..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Answer</label>
                <textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm resize-none"
                  placeholder="Enter the answer..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                  <input
                    type="text"
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="e.g., Verification"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={faqForm.sortOrder}
                    onChange={(e) => setFaqForm({ ...faqForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                    min={0}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="faqPublished"
                  checked={faqForm.isPublished}
                  onChange={(e) => setFaqForm({ ...faqForm, isPublished: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="faqPublished" className="text-sm text-slate-600">Published</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setFaqModal(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (faqModal === "create") {
                      const res = await apiService.createFaq(faqForm);
                      setAdminFaqs((prev) => [...prev, res.data]);
                      showToast.success("FAQ created");
                    } else {
                      const res = await apiService.updateFaq(faqModal.id, faqForm);
                      setAdminFaqs((prev) => prev.map((f) => f.id === faqModal.id ? res.data : f));
                      showToast.success("FAQ updated");
                    }
                    setFaqModal(null);
                  } catch {
                    showToast.error("Failed to save FAQ");
                  }
                }}
                disabled={!faqForm.question.trim() || !faqForm.answer.trim() || !faqForm.category.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {faqModal === "create" ? "Create" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Reject Issuer Application</h3>
              <button
                onClick={() => { setShowRejectModal(false); setRejectingUserId(null); setRejectReason(""); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason for rejection. This will be sent to the applicant via email.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(false); setRejectingUserId(null); setRejectReason(""); }}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectIssuer}
                disabled={!rejectReason.trim() || approvalLoading === rejectingUserId}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {approvalLoading === rejectingUserId ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
