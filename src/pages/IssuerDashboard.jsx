import { useState, useEffect } from "react";
import {
  FileText,
  Users,
  Building2,
  Search,
  ExternalLink,
  Clock,
  Download,
  Upload,
  Wand2,
  FolderOpen,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWalletStore from "../store/wallet";
import apiService from "../services/api";
import Header from "../components/Header";
import ExtensionHeader from "../components/ExtensionHeader";
import NavigationHeader from "../components/NavigationHeader";

const isExtension = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.chrome !== "undefined" &&
    window.chrome.runtime &&
    window.chrome.runtime.id
  );
};

const IssuerDashboard = () => {
  const { user } = useWalletStore();
  const navigate = useNavigate();
  const isExt = isExtension();
  const [documents, setDocuments] = useState([]);
  const [holders, setHolders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("documents"); // "documents" or "holders"
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Quick actions for issuers
  const quickActions = [
    {
      title: "PDF Generator",
      description: "Design & generate certificate PDFs",
      icon: FileText,
      action: () => navigate("/certificate-generator"),
      gradient: "from-orange-500 to-red-400",
    },
    {
      title: "Smart Template Editor",
      description: "AI-powered template editor with smart positioning",
      icon: Wand2,
      action: () => navigate("/smart-template-editor"),
      gradient: "from-purple-500 to-indigo-500",
      badge: "NEW",
    },
    {
      title: "Batch Upload",
      description: "Process multiple certificates",
      icon: Upload,
      action: () => navigate("/batch-upload"),
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      title: "Issue Certificate",
      description: "Create new certificates",
      icon: Plus,
      action: () => navigate("/batch-upload"),
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  useEffect(() => {
    if (activeTab === "documents") {
      fetchDocuments();
    } else {
      fetchHolders();
    }
    fetchStats();
  }, [activeTab, page]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getIssuerDocuments({ page, limit: 10 });
      setDocuments(response.documents || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHolders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getIssuerHolders({ page, limit: 50 });
      setHolders(response.holders || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch holders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getIssuerStats();
      setStats(response.statistics);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.identityEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHolders = holders.filter(
    (holder) =>
      holder.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holder.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {isExt ? <ExtensionHeader /> : <Header />}
      {!isExt && <NavigationHeader />}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Batches</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.totalBatches || 0}
                  </p>
                </div>
                <Building2 className="text-purple-400" size={32} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Documents</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.totalDocuments || 0}
                  </p>
                </div>
                <FileText className="text-blue-400" size={32} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Holders</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.totalHolders || 0}
                  </p>
                </div>
                <Users className="text-green-400" size={32} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Certificates</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.issuedCertificates || 0}
                  </p>
                </div>
                <FileText className="text-yellow-400" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 transition-all duration-200 group text-left"
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
                    <p className="text-gray-400 group-hover:text-gray-300 text-sm">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => {
                setActiveTab("documents");
                setPage(1);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "documents"
                  ? "bg-purple-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => {
                setActiveTab("holders");
                setPage(1);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "holders"
                  ? "bg-purple-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Holders
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={
                activeTab === "documents"
                  ? "Search documents..."
                  : "Search holders..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === "documents" ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Issued Documents
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <Clock className="animate-spin text-purple-400 mx-auto mb-4" size={32} />
                <p className="text-gray-400">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="text-gray-500 mx-auto mb-4" size={48} />
                <p className="text-gray-400 text-lg">No documents found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Documents you issue will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id || doc.docId}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {doc.title}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Holder</p>
                              <p className="text-white">{doc.studentName || "N/A"}</p>
                              <p className="text-gray-500 text-xs">
                                {doc.identityEmail}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Issued</p>
                              <p className="text-white">
                                {doc.issuedAt
                                  ? new Date(doc.issuedAt).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                            {doc.blockchain?.transactionId && (
                              <div>
                                <p className="text-gray-400">Transaction</p>
                                <a
                                  href={doc.blockchain.explorerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                >
                                  View
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            )}
                            {doc.verification?.verifyUrl && (
                              <div>
                                <p className="text-gray-400">Verification</p>
                                <a
                                  href={doc.verification.verifyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                  Verify
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                    >
                      Previous
                    </button>
                    <span className="text-gray-400">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={page === pagination.pages}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Holders</h2>

            {loading ? (
              <div className="text-center py-12">
                <Clock className="animate-spin text-purple-400 mx-auto mb-4" size={32} />
                <p className="text-gray-400">Loading holders...</p>
              </div>
            ) : filteredHolders.length === 0 ? (
              <div className="text-center py-12">
                <Users className="text-gray-500 mx-auto mb-4" size={48} />
                <p className="text-gray-400 text-lg">No holders found</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredHolders.map((holder, index) => (
                    <div
                      key={holder.email || index}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {holder.name || holder.email}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3">
                            {holder.email}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Documents</p>
                              <p className="text-white font-semibold">
                                {holder.documentCount || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Latest Document</p>
                              <p className="text-white">
                                {holder.latestDocument?.title || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Last Issued</p>
                              <p className="text-white">
                                {holder.latestDocumentDate
                                  ? new Date(
                                      holder.latestDocumentDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                    >
                      Previous
                    </button>
                    <span className="text-gray-400">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={page === pagination.pages}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuerDashboard;

