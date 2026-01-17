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
    // {
    //   title: "PDF Generator",
    //   description: "Design & generate certificate PDFs",
    //   icon: FileText,
    //   action: () => navigate("/certificate-generator"),
    // },
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
      doc.identityEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredHeldDocuments = heldDocuments.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.issuer?.toLowerCase().includes(searchTerm.toLowerCase()),
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
        "PDF not available for this document. The document may not have been uploaded to IPFS yet.",
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
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Total Batches
                  </p>
                  <p className="text-3xl font-bold text-[#2A1B5D]">
                    {stats.totalBatches || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="text-[#3834A8]" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Total Documents
                  </p>
                  <p className="text-3xl font-bold text-[#2A1B5D]">
                    {stats.totalDocuments || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Total Holders
                  </p>
                  <p className="text-3xl font-bold text-[#2A1B5D]">
                    {stats.totalHolders || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Certificates
                  </p>
                  <p className="text-3xl font-bold text-[#2A1B5D]">
                    {stats.issuedCertificates || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-amber-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#2A1B5D] mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-gray-50 hover:bg-white border border-gray-200 hover:border-[#3834A8]/30 rounded-xl p-5 transition-all duration-200 group text-left hover:shadow-md"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-[#3834A8] group-hover:bg-[#2A1B5D] rounded-xl flex items-center justify-center group-hover:scale-105 transition-all">
                    <action.icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[#2A1B5D] flex items-center gap-2">
                      {action.title}
                      {action.badge && (
                        <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                          {action.badge}
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                setActiveTab("issued");
                setPage(1);
              }}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === "issued"
                  ? "bg-[#3834A8] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Issued Documents
            </button>
            <button
              onClick={() => {
                setActiveTab("held");
                setPage(1);
              }}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === "held"
                  ? "bg-[#3834A8] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Held Documents
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3834A8]/20 focus:border-[#3834A8] transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === "issued" ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#2A1B5D] mb-2">
              Issued Documents
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Documents you have issued to others (single or multiple)
            </p>

            {loading ? (
              <div className="text-center py-12">
                <Clock
                  className="animate-spin text-[#3834A8] mx-auto mb-4"
                  size={32}
                />
                <p className="text-gray-500">Loading documents...</p>
              </div>
            ) : filteredIssuedDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-gray-700 text-lg">
                  No issued documents found
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Documents you issue will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredIssuedDocuments.map((doc) => (
                    <div
                      key={doc.id || doc.docId}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-[#3834A8]/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#2A1B5D] mb-3">
                            {doc.title}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 font-medium">
                                Holder
                              </p>
                              <p className="text-gray-800">
                                {doc.studentName || "N/A"}
                              </p>
                              <p className="text-[#3834A8] text-xs">
                                {doc.identityEmail}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium">
                                Issued
                              </p>
                              <p className="text-gray-800">
                                {doc.issuedAt
                                  ? new Date(doc.issuedAt).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                            {doc.blockchain?.transactionId && (
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Transaction
                                </p>
                                <a
                                  href={doc.blockchain.explorerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#3834A8] hover:text-[#2A1B5D] flex items-center gap-1"
                                >
                                  View
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            )}
                            {doc.verification?.verifyUrl && (
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Verification
                                </p>
                                <a
                                  href={doc.verification.verifyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#3834A8] hover:text-[#2A1B5D] flex items-center gap-1"
                                >
                                  Verify
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewPDF(doc)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#3834A8] hover:bg-[#2A1B5D] rounded-xl text-white transition-all shadow-sm"
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
                      className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={page === pagination.pages}
                      className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#2A1B5D] mb-2">
              Held Documents
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Your personal authenticated documents (like a holder would see)
            </p>

            {loading ? (
              <div className="text-center py-12">
                <Clock
                  className="animate-spin text-[#3834A8] mx-auto mb-4"
                  size={32}
                />
                <p className="text-gray-500">Loading documents...</p>
              </div>
            ) : filteredHeldDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-gray-700 text-lg">No held documents found</p>
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
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                            Batch Document
                          </span>
                        );
                      }
                      return (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-600 rounded-full">
                          Certificate
                        </span>
                      );
                    };

                    return (
                      <div
                        key={doc.id || doc.docId}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-[#3834A8]/30 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-[#2A1B5D]">
                                {doc.title}
                              </h3>
                              {getDocumentTypeBadge(doc.type)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Issuer
                                </p>
                                <p className="text-gray-800">
                                  {doc.issuer || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">
                                  Issued
                                </p>
                                <p className="text-gray-800">
                                  {doc.issuedAt
                                    ? new Date(
                                        doc.issuedAt,
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                              {doc.blockchain?.transactionId && (
                                <div>
                                  <p className="text-gray-500 font-medium">
                                    Transaction
                                  </p>
                                  <a
                                    href={doc.blockchain.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#3834A8] hover:text-[#2A1B5D] flex items-center gap-1"
                                  >
                                    View
                                    <ExternalLink size={14} />
                                  </a>
                                </div>
                              )}
                              {doc.verification?.verifyUrl && (
                                <div>
                                  <p className="text-gray-500 font-medium">
                                    Verification
                                  </p>
                                  <a
                                    href={doc.verification.verifyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#3834A8] hover:text-[#2A1B5D] flex items-center gap-1"
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
                              className="flex items-center gap-2 px-4 py-2 bg-[#3834A8] hover:bg-[#2A1B5D] rounded-xl text-white transition-all shadow-sm"
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
                      className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={page === pagination.pages}
                      className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
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
