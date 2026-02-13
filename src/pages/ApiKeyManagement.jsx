import { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Copy,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  Activity,
  Webhook,
  AlertTriangle,
  Shield,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  Zap,
  Send,
  XCircle,
  Check,
  X,
  ExternalLink,
  FileText,
  Code,
  Download,
  BookOpen,
} from "lucide-react";
import apiService from "../services/api";
import showToast from "../utils/toast";
import Header from "../components/Header";
import ExtensionHeader from "../components/ExtensionHeader";
import NavigationHeader from "../components/NavigationHeader";
import LoadingSpinner from "../components/LoadingSpinner";

const isExtension = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.chrome !== "undefined" &&
    window.chrome.runtime &&
    window.chrome.runtime.id
  );
};

const ApiKeyManagement = () => {
  const isExt = isExtension();

  // State
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showDeliveriesModal, setShowDeliveriesModal] = useState(false);

  // Form data
  const [newKey, setNewKey] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    expiresAt: "",
    ipAllowlist: "",
    rateLimit: 100,
    rateLimitWindow: 3600000,
    permissions: ["batch:create", "batch:read"],
  });
  const [webhookForm, setWebhookForm] = useState({
    url: "",
    events: ["batch.completed", "batch.failed"],
  });
  const [selectedKeyId, setSelectedKeyId] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiService.getApiKeys();
      setApiKeys(response.apiKeys || []);
    } catch (error) {
      console.error("Failed to load API keys:", error);
      showToast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    showToast.success("Copied to clipboard!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      REVOKED: "bg-red-100 text-red-800 border-red-200",
      EXPIRED: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status] || styles.ACTIVE}`}>
        {status}
      </span>
    );
  };

  // Create API Key
  const handleCreateKey = async () => {
    if (!createForm.name.trim()) {
      showToast.error("Please enter a name for the API key");
      return;
    }

    try {
      setActionLoading(true);
      const data = {
        name: createForm.name.trim(),
        permissions: createForm.permissions,
        rateLimit: createForm.rateLimit,
        rateLimitWindow: createForm.rateLimitWindow,
      };

      if (createForm.expiresAt) {
        data.expiresAt = new Date(createForm.expiresAt).toISOString();
      }

      if (createForm.ipAllowlist.trim()) {
        data.ipAllowlist = createForm.ipAllowlist.split(",").map((ip) => ip.trim()).filter(Boolean);
      }

      const response = await apiService.createApiKey(data);

      if (response.success) {
        setNewKey(response.apiKey);
        setShowCreateModal(false);
        setShowKeyModal(true);
        loadApiKeys();
        setCreateForm({
          name: "",
          expiresAt: "",
          ipAllowlist: "",
          rateLimit: 100,
          rateLimitWindow: 3600000,
          permissions: ["batch:create", "batch:read"],
        });
        showToast.success("API key created successfully!");
      }
    } catch (error) {
      console.error("Failed to create API key:", error);
      showToast.error(error.response?.data?.message || "Failed to create API key");
    } finally {
      setActionLoading(false);
    }
  };

  // Revoke API Key
  const handleRevokeKey = async (keyId) => {
    if (!window.confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }

    try {
      setActionLoading(true);
      await apiService.revokeApiKey(keyId);
      showToast.success("API key revoked successfully");
      loadApiKeys();
    } catch (error) {
      console.error("Failed to revoke API key:", error);
      showToast.error(error.response?.data?.message || "Failed to revoke API key");
    } finally {
      setActionLoading(false);
    }
  };

  // Configure Webhook
  const handleConfigureWebhook = async () => {
    if (!webhookForm.url.startsWith("https://")) {
      showToast.error("Webhook URL must use HTTPS");
      return;
    }

    try {
      setActionLoading(true);
      const response = await apiService.configureWebhook(selectedKeyId, {
        url: webhookForm.url,
        events: webhookForm.events,
      });

      if (response.success) {
        showToast.success("Webhook configured successfully!");
        if (response.webhookConfig?.secret) {
          showToast.info("Save your webhook secret - it will only be shown once!");
        }
        setShowWebhookModal(false);
        loadApiKeys();
      }
    } catch (error) {
      console.error("Failed to configure webhook:", error);
      showToast.error(error.response?.data?.message || "Failed to configure webhook");
    } finally {
      setActionLoading(false);
    }
  };

  // Load Usage Stats
  const handleViewUsage = async (keyId) => {
    try {
      setSelectedKeyId(keyId);
      setUsageData(null);
      setShowUsageModal(true);

      const response = await apiService.getApiKeyUsage(keyId, 30);
      setUsageData(response.usage);
    } catch (error) {
      console.error("Failed to load usage stats:", error);
      showToast.error("Failed to load usage statistics");
    }
  };

  // Load Webhook Deliveries
  const handleViewDeliveries = async (keyId) => {
    try {
      setSelectedKeyId(keyId);
      setDeliveries([]);
      setShowDeliveriesModal(true);

      const response = await apiService.getWebhookDeliveries(keyId);
      setDeliveries(response.deliveries || []);
    } catch (error) {
      console.error("Failed to load deliveries:", error);
      showToast.error("Failed to load webhook deliveries");
    }
  };

  // Retry Failed Delivery
  const handleRetryDelivery = async (keyId, deliveryId) => {
    try {
      setActionLoading(true);
      await apiService.retryWebhookDelivery(keyId, deliveryId);
      showToast.success("Webhook retry initiated");
      handleViewDeliveries(keyId);
    } catch (error) {
      console.error("Failed to retry delivery:", error);
      showToast.error(error.response?.data?.message || "Failed to retry delivery");
    } finally {
      setActionLoading(false);
    }
  };

  // Open webhook config modal
  const openWebhookModal = (keyId, existingConfig) => {
    setSelectedKeyId(keyId);
    if (existingConfig) {
      setWebhookForm({
        url: existingConfig.url || "",
        events: existingConfig.events || ["batch.completed", "batch.failed"],
      });
    } else {
      setWebhookForm({
        url: "",
        events: ["batch.completed", "batch.failed"],
      });
    }
    setShowWebhookModal(true);
  };

  const togglePermission = (permission) => {
    setCreateForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const toggleWebhookEvent = (event) => {
    setWebhookForm((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  return (
    <div className="min-h-screen bg-brand-background">
      {isExt ? <ExtensionHeader /> : <Header />}
      {!isExt && <NavigationHeader />}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2A1B5D] mb-2">API Keys</h1>
            <p className="text-gray-600">
              Manage API keys for external system integrations
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3834A8] hover:bg-[#2A1B5D] text-white rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Create API Key
          </button>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">Security Notice</h3>
            <p className="text-sm text-amber-800">
              API keys provide programmatic access to your account. Keep them secure and never expose them in client-side code or public repositories.
            </p>
          </div>
        </div>

        {/* API Keys List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No API Keys</h3>
            <p className="text-gray-600 mb-6">
              Create your first API key to enable external system integrations.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3834A8] hover:bg-[#2A1B5D] text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
              Create API Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Key Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedKey(expandedKey === apiKey.id ? null : apiKey.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#3834A8]/10 rounded-lg flex items-center justify-center">
                      <Key size={20} className="text-[#3834A8]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{apiKey.name}</h3>
                        {getStatusBadge(apiKey.status)}
                      </div>
                      <p className="text-sm text-gray-500 font-mono">{apiKey.keyPrefix}...</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-500">Last used</p>
                      <p className="text-gray-900">{apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : "Never"}</p>
                    </div>
                    {expandedKey === apiKey.id ? (
                      <ChevronDown size={20} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedKey === apiKey.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Total Requests</p>
                        <p className="text-lg font-semibold text-gray-900">{apiKey.totalRequests || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Batch Jobs</p>
                        <p className="text-lg font-semibold text-gray-900">{apiKey.totalJobs || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Rate Limit</p>
                        <p className="text-lg font-semibold text-gray-900">{apiKey.rateLimit}/hr</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Expires</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : "Never"}
                        </p>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {apiKey.permissions.map((perm) => (
                          <span key={perm} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* IP Allowlist */}
                    {apiKey.ipAllowlist && apiKey.ipAllowlist.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">IP Allowlist</p>
                        <div className="flex flex-wrap gap-2">
                          {apiKey.ipAllowlist.map((ip) => (
                            <span key={ip} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-mono">
                              {ip}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Webhook Status */}
                    {apiKey.webhookConfig && (
                      <div className="mb-4 bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Webhook size={16} className="text-[#3834A8]" />
                            <span className="text-sm font-medium">Webhook</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${apiKey.webhookConfig.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                              {apiKey.webhookConfig.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewDeliveries(apiKey.id)}
                            className="text-xs text-[#3834A8] hover:underline"
                          >
                            View Deliveries
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-mono truncate">{apiKey.webhookConfig.url}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleViewUsage(apiKey.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Activity size={14} />
                        Usage Stats
                      </button>
                      <button
                        onClick={() => openWebhookModal(apiKey.id, apiKey.webhookConfig)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Webhook size={14} />
                        {apiKey.webhookConfig ? "Edit Webhook" : "Add Webhook"}
                      </button>
                      {apiKey.status === "ACTIVE" && (
                        <button
                          onClick={() => handleRevokeKey(apiKey.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* API Documentation Section */}
        <div className="mt-8 space-y-6">
          {/* Documentation Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3834A8] rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">API Integration Guide</h2>
              <p className="text-sm text-gray-600">Complete instructions for using the External Batch Upload API</p>
            </div>
          </div>

          {/* Base URL */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Globe size={18} className="text-[#3834A8]" />
              Base URL
            </h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <code className="text-green-400 font-mono text-sm">
                {import.meta.env.VITE_API_BASE_URL || "https://xertiq-backend.onrender.com/api"}/external
              </code>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Key size={18} className="text-[#3834A8]" />
              Authentication
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Include your API key in every request using one of these methods:
            </p>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Option 1: Authorization Header (Recommended)</p>
                <code className="text-sm font-mono text-gray-800">Authorization: Bearer xertiq_pk_your_api_key_here</code>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Option 2: X-API-Key Header</p>
                <code className="text-sm font-mono text-gray-800">X-API-Key: xertiq_pk_your_api_key_here</code>
              </div>
            </div>
          </div>

          {/* CSV Format Requirements */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-[#3834A8]" />
              CSV File Requirements
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your metadata CSV file must contain the following columns. The <code className="bg-gray-100 px-1 rounded">filename</code> column is used to match each row to its corresponding PDF file.
            </p>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-gray-900 border-b">Column Name</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-900 border-b">Required</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-900 border-b">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-mono text-[#3834A8]">filename</td>
                    <td className="px-4 py-2"><span className="text-red-600 font-semibold">Yes</span></td>
                    <td className="px-4 py-2 text-gray-600">Must match exact PDF filename (e.g., "john_doe.pdf")</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-mono text-[#3834A8]">identityEmail</td>
                    <td className="px-4 py-2"><span className="text-red-600 font-semibold">Yes</span></td>
                    <td className="px-4 py-2 text-gray-600">Recipient's email address for verification</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-mono text-[#3834A8]">identityBirthday</td>
                    <td className="px-4 py-2"><span className="text-red-600 font-semibold">Yes</span></td>
                    <td className="px-4 py-2 text-gray-600">Date of birth (format: YYYY-MM-DD)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-mono text-[#3834A8]">identityGender</td>
                    <td className="px-4 py-2"><span className="text-red-600 font-semibold">Yes</span></td>
                    <td className="px-4 py-2 text-gray-600">Gender (Male/Female/Other)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-mono text-[#3834A8]">name</td>
                    <td className="px-4 py-2"><span className="text-amber-600 font-semibold">Recommended</span></td>
                    <td className="px-4 py-2 text-gray-600">Full name of the certificate holder</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-mono text-[#3834A8]">course</td>
                    <td className="px-4 py-2">Optional</td>
                    <td className="px-4 py-2 text-gray-600">Course or program name</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-mono text-[#3834A8]">studentNumber</td>
                    <td className="px-4 py-2">Optional</td>
                    <td className="px-4 py-2 text-gray-600">Student ID or reference number</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-[#3834A8]">completion_date</td>
                    <td className="px-4 py-2">Optional</td>
                    <td className="px-4 py-2 text-gray-600">Date of completion (YYYY-MM-DD)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Sample CSV Content:</p>
              <pre className="text-green-400 font-mono text-xs overflow-x-auto whitespace-pre">{`filename,identityEmail,identityBirthday,identityGender,name,course,studentNumber
john_doe_cert.pdf,john.doe@email.com,1995-03-15,Male,John Doe,Computer Science,STU-2024-001
jane_smith_cert.pdf,jane.smith@email.com,1998-07-22,Female,Jane Smith,Data Science,STU-2024-002
bob_wilson_cert.pdf,bob.wilson@email.com,1992-11-08,Male,Bob Wilson,Web Development,STU-2024-003`}</pre>
            </div>
          </div>

          {/* PDF File Naming */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-[#3834A8]" />
              PDF File Naming Convention
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Each PDF filename must exactly match the <code className="bg-amber-100 px-1 rounded">filename</code> column value in your CSV file.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Good Examples:</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li><code className="bg-gray-100 px-1 rounded">john_doe_cert.pdf</code> - Use underscores, no spaces</li>
                    <li><code className="bg-gray-100 px-1 rounded">certificate_001.pdf</code> - Sequential numbering</li>
                    <li><code className="bg-gray-100 px-1 rounded">STU2024001.pdf</code> - Student ID based</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Avoid:</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li><code className="bg-gray-100 px-1 rounded">John Doe Certificate.pdf</code> - Spaces in filename</li>
                    <li><code className="bg-gray-100 px-1 rounded">certificate(1).pdf</code> - Special characters</li>
                    <li><code className="bg-gray-100 px-1 rounded">cert.PDF</code> - Case sensitivity matters</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Postman Instructions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Code size={18} className="text-[#3834A8]" />
              Using Postman
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Follow these steps to upload a batch using Postman:
            </p>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-[#3834A8] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <p className="font-semibold text-gray-900">Create a new POST request</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 mt-2">
                  <code className="text-green-400 font-mono text-sm">
                    POST {import.meta.env.VITE_API_BASE_URL || "https://xertiq-backend.onrender.com/api"}/external/batch
                  </code>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-[#3834A8] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <p className="font-semibold text-gray-900">Add Authorization Header</p>
                </div>
                <p className="text-sm text-gray-600 mb-2">Go to the "Headers" tab and add:</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    <span className="text-gray-600">Key:</span>
                    <span className="text-gray-900">Authorization</span>
                    <span className="text-gray-600">Value:</span>
                    <span className="text-gray-900">Bearer xertiq_pk_your_api_key</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-[#3834A8] text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <p className="font-semibold text-gray-900">Configure Body as form-data</p>
                </div>
                <p className="text-sm text-gray-600 mb-2">Go to "Body" tab, select "form-data", and add:</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-sm font-mono border-b pb-2">
                    <span className="font-semibold text-gray-700">Key</span>
                    <span className="font-semibold text-gray-700">Type</span>
                    <span className="font-semibold text-gray-700">Value</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <code className="text-[#3834A8]">metadata</code>
                    <span className="text-orange-600">File</span>
                    <span className="text-gray-600">Select your CSV file</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <code className="text-[#3834A8]">certificates</code>
                    <span className="text-orange-600">File</span>
                    <span className="text-gray-600">Select all PDF files</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <code className="text-[#3834A8]">docType</code>
                    <span className="text-blue-600">Text</span>
                    <span className="text-gray-600">CERTIFICATE (optional)</span>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> To select multiple PDF files in Postman, hover over the "certificates" row, click the dropdown arrow next to "File", and select multiple files.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-[#3834A8] text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <p className="font-semibold text-gray-900">Send Request</p>
                </div>
                <p className="text-sm text-gray-600 mb-2">Click "Send". You'll receive a response with a job ID:</p>
                <div className="bg-gray-900 rounded-lg p-3">
                  <pre className="text-green-400 font-mono text-xs overflow-x-auto">{`{
  "success": true,
  "message": "Batch job queued for processing",
  "job": {
    "id": "clxxx123456789",
    "status": "QUEUED",
    "documentCount": 3,
    "creditsReserved": 12
  },
  "statusUrl": "/api/external/batch/clxxx123456789/status"
}`}</pre>
                </div>
              </div>

              {/* Step 5 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-[#3834A8] text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  <p className="font-semibold text-gray-900">Check Job Status</p>
                </div>
                <p className="text-sm text-gray-600 mb-2">Create a GET request to check processing status:</p>
                <div className="bg-gray-900 rounded-lg p-3">
                  <code className="text-green-400 font-mono text-sm">
                    GET {import.meta.env.VITE_API_BASE_URL || "https://xertiq-backend.onrender.com/api"}/external/batch/YOUR_JOB_ID/status
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* cURL Examples */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Code size={18} className="text-[#3834A8]" />
              cURL Examples
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Upload Batch:</p>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">{`curl -X POST "${import.meta.env.VITE_API_BASE_URL || "https://xertiq-backend.onrender.com/api"}/external/batch" \\
  -H "Authorization: Bearer xertiq_pk_your_api_key_here" \\
  -F "metadata=@/path/to/metadata.csv" \\
  -F "certificates=@/path/to/john_doe_cert.pdf" \\
  -F "certificates=@/path/to/jane_smith_cert.pdf" \\
  -F "docType=CERTIFICATE"`}</pre>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Check Job Status:</p>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 font-mono text-xs">{`curl -X GET "${import.meta.env.VITE_API_BASE_URL || "https://xertiq-backend.onrender.com/api"}/external/batch/YOUR_JOB_ID/status" \\
  -H "Authorization: Bearer xertiq_pk_your_api_key_here"`}</pre>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Check Credit Balance:</p>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 font-mono text-xs">{`curl -X GET "${import.meta.env.VITE_API_BASE_URL || "https://xertiq-backend.onrender.com/api"}/external/credits" \\
  -H "Authorization: Bearer xertiq_pk_your_api_key_here"`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Costs */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap size={18} className="text-[#3834A8]" />
              Credit Costs
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Credits are deducted upfront when a batch job is submitted. Here's the breakdown:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#3834A8]">2</p>
                <p className="text-sm text-gray-600">credits per PDF</p>
                <p className="text-xs text-gray-500 mt-1">PDF Generation</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#3834A8]">1</p>
                <p className="text-sm text-gray-600">credit per document</p>
                <p className="text-xs text-gray-500 mt-1">IPFS Upload</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-[#3834A8]">3</p>
                <p className="text-sm text-gray-600">credits per batch</p>
                <p className="text-xs text-gray-500 mt-1">Blockchain Anchor</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Example:</strong> A batch of 10 certificates costs: (10 x 2) + (10 x 1) + 3 = <strong>33 credits</strong>
              </p>
            </div>
          </div>

          {/* Available Endpoints */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ExternalLink size={18} className="text-[#3834A8]" />
              All Available Endpoints
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-gray-900">Method</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-900">Endpoint</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-mono text-xs">POST</span></td>
                    <td className="px-4 py-2 font-mono text-sm">/external/batch</td>
                    <td className="px-4 py-2 text-gray-600">Upload and process certificate batch</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono text-xs">GET</span></td>
                    <td className="px-4 py-2 font-mono text-sm">/external/batch/:jobId/status</td>
                    <td className="px-4 py-2 text-gray-600">Get job status and details</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono text-xs">GET</span></td>
                    <td className="px-4 py-2 font-mono text-sm">/external/batch</td>
                    <td className="px-4 py-2 text-gray-600">List all jobs for this API key</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono text-xs">GET</span></td>
                    <td className="px-4 py-2 font-mono text-sm">/external/credits</td>
                    <td className="px-4 py-2 text-gray-600">Check your credit balance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Webhook Documentation */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Webhook size={18} className="text-[#3834A8]" />
              Webhook Events
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure webhooks to receive real-time notifications when batch jobs complete.
            </p>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-mono text-sm text-gray-900 mb-1">batch.started</p>
                <p className="text-xs text-gray-600">Sent when batch processing begins</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-mono text-sm text-gray-900 mb-1">batch.completed</p>
                <p className="text-xs text-gray-600">Sent when all documents are successfully processed</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-mono text-sm text-gray-900 mb-1">batch.failed</p>
                <p className="text-xs text-gray-600">Sent when processing fails or partially fails</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Webhook Payload Example:</p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 font-mono text-xs">{`{
  "event": "batch.completed",
  "jobId": "clxxx123456789",
  "batchId": "batch_abc123",
  "status": "COMPLETED",
  "documentCount": 10,
  "successCount": 10,
  "failedCount": 0,
  "creditsUsed": 33,
  "completedAt": "2024-01-15T10:30:00.000Z"
}`}</pre>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Signature Verification:</p>
              <p className="text-sm text-gray-600 mb-2">
                Webhooks are signed using HMAC-SHA256. The signature is in the <code className="bg-gray-100 px-1 rounded">X-XertiQ-Signature</code> header:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 font-mono text-xs">{`X-XertiQ-Signature: t=1705312200000,v1=abc123def456...

// Verify in your code:
const signaturePayload = \`\${timestamp}.\${JSON.stringify(body)}\`;
const expectedSig = crypto
  .createHmac('sha256', webhookSecret)
  .update(signaturePayload)
  .digest('hex');`}</pre>
              </div>
            </div>
          </div>

          {/* Error Codes */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#3834A8]" />
              Error Codes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-gray-900">Status</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2"><code className="bg-red-100 text-red-800 px-2 py-0.5 rounded">401</code></td>
                    <td className="px-4 py-2 text-gray-600">Invalid, expired, or revoked API key</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2"><code className="bg-red-100 text-red-800 px-2 py-0.5 rounded">402</code></td>
                    <td className="px-4 py-2 text-gray-600">Insufficient credits for this operation</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2"><code className="bg-red-100 text-red-800 px-2 py-0.5 rounded">403</code></td>
                    <td className="px-4 py-2 text-gray-600">IP address not in allowlist or missing permission</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2"><code className="bg-red-100 text-red-800 px-2 py-0.5 rounded">429</code></td>
                    <td className="px-4 py-2 text-gray-600">Rate limit exceeded or too many concurrent jobs</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2"><code className="bg-red-100 text-red-800 px-2 py-0.5 rounded">400</code></td>
                    <td className="px-4 py-2 text-gray-600">Missing files, invalid CSV, or filename mismatch</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create API Key</h2>
              <p className="text-sm text-gray-600">Generate a new API key for external integrations</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g., Production Server, LMS Integration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3834A8] focus:border-transparent"
                />
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={createForm.expiresAt}
                  onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3834A8] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
              </div>

              {/* IP Allowlist */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Allowlist (Optional)
                </label>
                <input
                  type="text"
                  value={createForm.ipAllowlist}
                  onChange={(e) => setCreateForm({ ...createForm, ipAllowlist: e.target.value })}
                  placeholder="e.g., 192.168.1.1, 10.0.0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3834A8] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated IP addresses. Leave empty to allow all.</p>
              </div>

              {/* Rate Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Limit (requests/hour)
                </label>
                <input
                  type="number"
                  value={createForm.rateLimit}
                  onChange={(e) => setCreateForm({ ...createForm, rateLimit: parseInt(e.target.value) || 100 })}
                  min={1}
                  max={10000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3834A8] focus:border-transparent"
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2">
                  {[
                    { id: "batch:create", label: "Create Batches", desc: "Upload and process certificate batches" },
                    { id: "batch:read", label: "Read Batches", desc: "View batch status and job history" },
                    { id: "batch:delete", label: "Delete Batches", desc: "Delete batch jobs (not implemented)" },
                    { id: "webhook:manage", label: "Manage Webhooks", desc: "Configure webhook endpoints" },
                  ].map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={createForm.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{perm.label}</p>
                        <p className="text-xs text-gray-500">{perm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#3834A8] hover:bg-[#2A1B5D] text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? <LoadingSpinner size="sm" /> : <Plus size={18} />}
                Create API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Key Display Modal */}
      {showKeyModal && newKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">API Key Created!</h2>
                  <p className="text-sm text-gray-600">Copy your key now - it won't be shown again</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Make sure to copy your API key now. You won't be able to see it again!
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your API Key</label>
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                  <code className="text-sm font-mono text-gray-800 break-all">{newKey.key}</code>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(newKey.key, "new-api-key")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#3834A8] hover:bg-[#2A1B5D] text-white rounded-lg transition-colors"
              >
                {copiedText === "new-api-key" ? (
                  <>
                    <CheckCircle size={18} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setNewKey(null);
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                I've copied my key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Configuration Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Configure Webhook</h2>
              <p className="text-sm text-gray-600">Receive notifications when batch jobs complete</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                  placeholder="https://your-server.com/webhook"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3834A8] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Must be a valid HTTPS URL</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
                <div className="space-y-2">
                  {[
                    { id: "batch.started", label: "Batch Started", desc: "When processing begins" },
                    { id: "batch.completed", label: "Batch Completed", desc: "When processing succeeds" },
                    { id: "batch.failed", label: "Batch Failed", desc: "When processing fails" },
                  ].map((event) => (
                    <label
                      key={event.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={webhookForm.events.includes(event.id)}
                        onChange={() => toggleWebhookEvent(event.id)}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{event.label}</p>
                        <p className="text-xs text-gray-500">{event.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Webhooks are signed with HMAC-SHA256. The signature is included in the <code className="bg-blue-100 px-1 rounded">X-XertiQ-Signature</code> header.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfigureWebhook}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#3834A8] hover:bg-[#2A1B5D] text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? <LoadingSpinner size="sm" /> : <Webhook size={18} />}
                Save Webhook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats Modal */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Usage Statistics</h2>
                <p className="text-sm text-gray-600">Last 30 days</p>
              </div>
              <button onClick={() => setShowUsageModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {!usageData ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{usageData.summary.totalRequests}</p>
                      <p className="text-sm text-gray-600">Total Requests</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{usageData.summary.totalCreditsUsed}</p>
                      <p className="text-sm text-gray-600">Credits Used</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{usageData.summary.avgResponseTime}ms</p>
                      <p className="text-sm text-gray-600">Avg Response</p>
                    </div>
                  </div>

                  {/* Endpoint Stats */}
                  {Object.keys(usageData.endpointStats || {}).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Endpoints</h3>
                      <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                        {Object.entries(usageData.endpointStats).map(([endpoint, stats]) => (
                          <div key={endpoint} className="p-3 flex items-center justify-between">
                            <code className="text-sm font-mono text-gray-700">{endpoint}</code>
                            <div className="text-sm text-gray-600">
                              {stats.count} calls, avg {stats.avgResponseTime}ms
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Batch Jobs */}
                  {usageData.batchJobs && usageData.batchJobs.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Recent Batch Jobs</h3>
                      <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                        {usageData.batchJobs.slice(0, 10).map((job) => (
                          <div key={job.id} className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{job.documentCount} documents</p>
                              <p className="text-xs text-gray-500">{formatDate(job.createdAt)}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              job.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                              job.status === "FAILED" ? "bg-red-100 text-red-800" :
                              job.status === "PROCESSING" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {job.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Webhook Deliveries Modal */}
      {showDeliveriesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Webhook Deliveries</h2>
                <p className="text-sm text-gray-600">Recent webhook delivery attempts</p>
              </div>
              <button onClick={() => setShowDeliveriesModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {deliveries.length === 0 ? (
                <div className="text-center py-12">
                  <Webhook size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No webhook deliveries yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            delivery.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                            delivery.status === "FAILED" ? "bg-red-100 text-red-800" :
                            delivery.status === "RETRYING" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {delivery.status}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{delivery.event}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(delivery.createdAt)}</span>
                      </div>

                      {delivery.httpStatus && (
                        <p className="text-xs text-gray-600 mb-1">HTTP Status: {delivery.httpStatus}</p>
                      )}

                      {delivery.errorMessage && (
                        <p className="text-xs text-red-600 mb-2">{delivery.errorMessage}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Attempts: {delivery.attemptCount}
                        </span>
                        {delivery.status === "FAILED" && (
                          <button
                            onClick={() => handleRetryDelivery(selectedKeyId, delivery.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 text-xs text-[#3834A8] hover:underline"
                          >
                            <RefreshCw size={12} />
                            Retry
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManagement;
