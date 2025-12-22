import { useState, useEffect } from "react";
import {
  Users,
  CreditCard,
  FileText,
  Shield,
  TrendingUp,
  Search,
  Filter,
  Edit,
  Eye,
  Coins,
  Activity,
} from "lucide-react";
import apiService from "../services/api";
import useWalletStore from "../store/wallet";
import Header from "../components/Header";
import ExtensionHeader from "../components/ExtensionHeader";
import NavigationHeader from "../components/NavigationHeader";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminPanel = () => {
  const { user, token } = useWalletStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [creditDefaults, setCreditDefaults] = useState(null);
  const [defaultsForm, setDefaultsForm] = useState(null);
  const [defaultsLoading, setDefaultsLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      return;
    }
    loadData();
  }, [activeTab, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") {
        const statsRes = await apiService.get("/admin/stats");
        setStats(statsRes.data);
      } else if (activeTab === "users") {
        const usersRes = await apiService.get("/admin/users");
        setUsers(usersRes.data.users);
      } else if (activeTab === "transactions") {
        const txRes = await apiService.get("/admin/transactions");
        setTransactions(txRes.data.transactions);
      } else if (activeTab === "audit") {
        const auditRes = await apiService.get("/admin/audit-logs");
        setAuditLogs(auditRes.data.logs);
      } else if (activeTab === "credits") {
        setDefaultsLoading(true);
        const defaultsRes = await apiService.getCreditDefaults();
        const defaults = defaultsRes.data;
        setCreditDefaults(defaults);
        setDefaultsForm(defaults);
        setDefaultsLoading(false);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await apiService.patch(`/admin/users/${userId}/role`, { role: newRole });
      await loadData();
      alert("User role updated successfully");
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update user role");
    }
  };

  const handleCreditsUpdate = async (userId, credits) => {
    try {
      await apiService.patch(`/admin/users/${userId}/credits`, {
        credits: parseInt(credits),
        reason: "Admin adjustment",
      });
      await loadData();
      alert("User credits updated successfully");
    } catch (error) {
      console.error("Failed to update credits:", error);
      alert("Failed to update user credits");
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
        // Ensure numeric types
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
      alert("Credit settings updated");
    } catch (error) {
      console.error("Failed to update credit defaults:", error);
      alert(
        error.response?.data?.message || "Failed to update credit defaults"
      );
    } finally {
      setDefaultsLoading(false);
    }
  };

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23] flex items-center justify-center">
        <div className="text-center">
          <Shield size={64} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">
            You need admin privileges to access this page
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "transactions", label: "Transactions", icon: CreditCard },
    { id: "credits", label: "Credits Config", icon: Coins },
    { id: "audit", label: "Audit Logs", icon: Activity },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23]">
      <Header />
      <NavigationHeader title="Admin Panel" showBack={true} />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex space-x-2 mb-8 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-white"
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
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="text-blue-400" size={32} />
                        <span className="text-3xl font-bold text-white">
                          {stats.users.total}
                        </span>
                      </div>
                      <p className="text-gray-400">Total Users</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <FileText className="text-green-400" size={32} />
                        <span className="text-3xl font-bold text-white">
                          {stats.documents.total}
                        </span>
                      </div>
                      <p className="text-gray-400">Documents</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Shield className="text-purple-400" size={32} />
                        <span className="text-3xl font-bold text-white">
                          {stats.certificates.total}
                        </span>
                      </div>
                      <p className="text-gray-400">Certificates</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Coins className="text-yellow-400" size={32} />
                        <span className="text-3xl font-bold text-white">
                          {stats.transactions.totalCreditsIssued}
                        </span>
                      </div>
                      <p className="text-gray-400">Credits Issued</p>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-2">
                      {stats.recentActivity.slice(0, 5).map((log, idx) => (
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
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-6">
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                      />
                    </div>
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
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredUsers.map((user) => (
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
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  handleRoleUpdate(user.id, e.target.value)
                                }
                                className="bg-white/5 border border-white/10 rounded px-3 py-1 text-white text-sm"
                              >
                                <option value="USER">User</option>
                                <option value="ISSUER">Issuer</option>
                                <option value="VALIDATOR">Validator</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-white">
                                  {user.creditWallet?.credits || 0}
                                </span>
                                <button
                                  onClick={() => {
                                    const credits = prompt(
                                      "Enter new credit amount:",
                                      user.creditWallet?.credits || 0
                                    );
                                    if (credits !== null) {
                                      handleCreditsUpdate(user.id, credits);
                                    }
                                  }}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <Edit size={16} />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Credits Config Tab */}
              {activeTab === "credits" && (
                <div className="space-y-6">
                  {defaultsLoading || !defaultsForm ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-white text-lg font-semibold">
                          Conversion & Signup Bonus
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-400">
                              Signup bonus (credits)
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
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">
                              1 credit equals (₱)
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
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400">
                              Credits per peso
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
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">
                          Current equivalence: ₱
                          {(defaultsForm.PesoToCredits?.peso || 1) /
                            (defaultsForm.PesoToCredits?.credits || 1)}
                          {" per credit"}
                        </p>
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
                        <p className="text-sm text-gray-400">
                          When enabled, users receive extra credits based on the
                          bonus percent after purchases/conversions.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleDefaultsSave}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold disabled:opacity-50"
                      disabled={defaultsLoading}
                    >
                      {defaultsLoading ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === "transactions" && (
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 text-white">
                            {tx.user?.email || "Unknown"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                tx.type === "PURCHASE"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white">
                            {tx.creditsChange > 0 ? "+" : ""}
                            {tx.creditsChange}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Audit Logs Tab */}
              {activeTab === "audit" && (
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          Resource
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 text-white text-sm">
                            {log.action}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {log.user?.email || "System"}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {log.resource || "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;


