import { useState, useEffect } from "react";
import showToast from "../utils/toast";
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
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWalletStore from "../store/wallet";
import apiService from "../services/api";
import Header from "../components/Header";
import ExtensionHeader from "../components/ExtensionHeader";
import NavigationHeader from "../components/NavigationHeader";
import PDFPreviewModal from "../components/PDFPreviewModal";

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
  const [issuedDocuments, setIssuedDocuments] = useState([]); // Documents issued by issuer
  const [heldDocuments, setHeldDocuments] = useState([]); // Personal documents held by issuer
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("issued"); // "issued" or "held"
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null); // { title, pdfUrl, docId }

  // Quick actions for issuers
  const quickActions = [
    {
      title: "PDF Generator",
      description: "Design & generate certificate PDFs",
      icon: FileText,
      action: () => navigate("/certificate-generator"),
    },
    {
      title: "Smart Template Editor",
      description: "AI-powered template editor with smart positioning",
      icon: Wand2,
      action: () => navigate("/smart-template-editor"),
      badge: "NEW",
    },
    {
      title: "Batch Upload",
      description: "Process multiple certificates",
      icon: Upload,
      action: () => navigate("/batch-upload"),
    },
    {
      title: "Issue Certificate",
      description: "Create new certificates",
      icon: Plus,
      action: () => navigate("/batch-upload"),
    },
  ];

  useEffect(() => {
    if (activeTab === "issued") {
      fetchIssuedDocuments();
    } else if (activeTab === "held") {
      fetchHeldDocuments();
    }
    fetchStats();
  }, [activeTab, page]);

  const fetchIssuedDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getIssuerDocuments({ page, limit: 10 });
      setIssuedDocuments(response.documents || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch issued documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeldDocuments = async () => {
    try {
      setLoading(true);
      // Use holder endpoint to get personal authenticated documents
      const response = await apiService.getHolderDocuments({ page, limit: 10 });
      setHeldDocuments(response.documents || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch held documents:", error);
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

  const filteredIssuedDocuments = issuedDocuments.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.identityEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHeldDocuments = heldDocuments.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.issuer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPDF = (doc) => {
    // Prefer displayCid (with QR code) over canonicalCid
    // Handle both formats: nested ipfs object or direct fields
    const pdfCid =
      doc.ipfs?.displayCid ||
      doc.ipfs?.canonicalCid ||
      doc.displayCid ||
      doc.canonicalCid;

    console.log("View PDF - Document data:", {
      doc,
      pdfCid,
      ipfs: doc.ipfs,
      displayCid: doc.displayCid,
      canonicalCid: doc.canonicalCid,
      allKeys: Object.keys(doc),
    });

    if (pdfCid) {
      setPreviewDoc({
        title: doc.title || doc.studentName || "Document",
        pdfUrl: pdfCid,
        docId: doc.docId || doc.id,
      });
    } else {
      showToast.warning(
        "PDF not available for this document. The document may not have been uploaded to IPFS yet."
      );
    }
  };

  return (
    <div className="min-h-screen bg-brand-background">
      {isExt ? <ExtensionHeader /> : <Header />}
      {!isExt && <NavigationHeader />}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white backdrop-blur-xl border border-brand-border rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brand-secondary text-sm mb-1">
                    Total Batches
                  </p>
                  <p className="text-3xl font-bold text-brand-text">
                    {stats.totalBatches || 0}
                  </p>
                </div>
                <Building2 className="text-brand-primaryDark" size={32} />
              </div>
            </div>

            <div className="bg-white backdrop-blur-xl border border-brand-border rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brand-secondary text-sm mb-1">
                    Total Documents
                  </p>
                  <p className="text-3xl font-bold text-brand-text">
                    {stats.totalDocuments || 0}
                  </p>
                </div>
                <FileText className="text-brand-secondary" size={32} />
              </div>
            </div>

            <div className="bg-white backdrop-blur-xl border border-brand-border rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brand-secondary text-sm mb-1">
                    Total Holders
                  </p>
                  <p className="text-3xl font-bold text-brand-text">
                    {stats.totalHolders || 0}
                  </p>
                </div>
                <Users className="text-green-400" size={32} />
              </div>
            </div>

            <div className="bg-white backdrop-blur-xl border border-brand-border rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brand-secondary text-sm mb-1">
                    Certificates
                  </p>
                  <p className="text-3xl font-bold text-brand-text">
                    {stats.issuedCertificates || 0}
                  </p>
                </div>
                <FileText className="text-yellow-400" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="bg-white backdrop-blur-xl border border-brand-border rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold text-brand-text mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-brand-background hover:bg-white border border-brand-border rounded-xl p-6 transition-all duration-200 group text-left shadow-md hover:shadow-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-dark hover:bg-darker rounded-xl flex items-center justify-center group-hover:scale-105 transition-all">
                    <action.icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-dark group-hover:text-darker flex items-center gap-2">
                      {action.title}
                      {action.badge && (
                        <span className="text-xs bg-yellow-400 text-gray-900 px-2 py-1 rounded-full font-bold">
                          {action.badge}
                        </span>
                      )}
                    </h3>
                    <p className="text-medium text-sm">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white backdrop-blur-xl border border-brand-border rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => {
                setActiveTab("issued");
                setPage(1);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "issued"
                  ? "bg-brand-primaryDark text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Issued Documents
            </button>
            <button
              onClick={() => {
                setActiveTab("held");
                setPage(1);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "held"
                  ? "bg-brand-primaryDark text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Held Documents
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-secondary"
              size={20}
            />
            <input
              type="text"
              placeholder={
                activeTab === "issued"
                  ? "Search issued documents..."
                  : "Search held documents..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-background border-2 border-brand-border rounded-xl px-10 py-2 text-brand-text placeholder-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === "issued" ? (
          <div className="bg-white backdrop-blur-xl border border-brand-border rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-brand-text mb-6">
              Issued Documents
            </h2>
            <p className="text-brand-secondary text-sm mb-6">
              Documents you have issued to others (single or multiple)
            </p>

            {loading ? (
              <div className="text-center py-12">
                <Clock
                  className="animate-spin text-purple-400 mx-auto mb-4"
                  size={32}
                />
                <p className="text-gray-400">Loading documents...</p>
              </div>
            ) : filteredIssuedDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText
                  className="text-brand-secondary mx-auto mb-4"
                  size={48}
                />
                <p className="text-brand-text text-lg">
                  No issued documents found
                </p>
                <p className="text-brand-secondary text-sm mt-2">
                  Documents you issue will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredIssuedDocuments.map((doc) => (
                    <div
                      key={doc.id || doc.docId}
                      className="bg-white border border-brand-border rounded-xl p-4 hover:bg-brand-background transition-all shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-brand-text mb-2">
                            {doc.title}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-brand-secondary">Holder</p>
                              <p className="text-brand-text">
                                {doc.studentName || "N/A"}
                              </p>
                              <p className="text-brand-secondary text-xs">
                                {doc.identityEmail}
                              </p>
                            </div>
                            <div>
                              <p className="text-brand-secondary">Issued</p>
                              <p className="text-brand-text">
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
                                  className="text-brand-primaryDark hover:text-brand-primary flex items-center gap-1"
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
                                  className="text-brand-secondary hover:text-brand-primary flex items-center gap-1"
                                >
                                  Verify
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleViewPDF(doc)}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-primaryDark/20 hover:bg-brand-primaryDark/30 border border-brand-primaryDark/30 rounded-xl text-brand-secondary transition-all"
                          >
                            <Eye size={16} />
                            View PDF
                          </button>
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
            <h2 className="text-2xl font-bold text-white mb-6">
              Held Documents
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Your personal authenticated documents (like a holder would see)
            </p>

            {loading ? (
              <div className="text-center py-12">
                <Clock
                  className="animate-spin text-purple-400 mx-auto mb-4"
                  size={32}
                />
                <p className="text-gray-400">Loading documents...</p>
              </div>
            ) : filteredHeldDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="text-gray-500 mx-auto mb-4" size={48} />
                <p className="text-gray-400 text-lg">No held documents found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Documents issued to you will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredHeldDocuments.map((doc) => {
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
                                <p className="text-white">
                                  {doc.issuer || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Issued</p>
                                <p className="text-white">
                                  {doc.issuedAt
                                    ? new Date(
                                        doc.issuedAt
                                      ).toLocaleDateString()
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
                          <div className="ml-4">
                            <button
                              onClick={() => handleViewPDF(doc)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 transition-all"
                            >
                              <Eye size={16} />
                              View PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        pdfUrl={previewDoc?.pdfUrl}
        title={previewDoc?.title}
        docId={previewDoc?.docId}
      />
    </div>
  );
};

export default IssuerDashboard;
