import { useState, useEffect } from "react";
import {
  FileText,
  Shield,
  CheckCircle,
  Clock,
  Search,
  Download,
  ExternalLink,
} from "lucide-react";
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

const HolderDashboard = () => {
  const { user } = useWalletStore();
  const isExt = isExtension();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [page]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getHolderDocuments({ page, limit: 10 });
      setDocuments(response.documents || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getHolderStats();
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.issuer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDocumentTypeBadge = (type) => {
    if (type === "BATCH_DOCUMENT") {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full">
          Batch Document
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full">
        Certificate
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {isExt ? <ExtensionHeader /> : <Header />}
      {!isExt && <NavigationHeader />}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Documents</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.totalDocuments || 0}
                  </p>
                </div>
                <FileText className="text-purple-400" size={32} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Batch Documents</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.totalBatchDocuments || 0}
                  </p>
                </div>
                <CheckCircle className="text-blue-400" size={32} />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Certificates</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.totalCertificates || 0}
                  </p>
                </div>
                <Shield className="text-green-400" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">My Documents</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>

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
                Documents issued to you will appear here
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
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {doc.title}
                          </h3>
                          {getDocumentTypeBadge(doc.type)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Issuer</p>
                            <p className="text-white">{doc.issuer || "N/A"}</p>
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
      </div>
    </div>
  );
};

export default HolderDashboard;

