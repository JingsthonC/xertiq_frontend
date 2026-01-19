import { useState, useEffect } from "react";
import showToast from "../utils/toast";
import {
  FileText,
  Shield,
  CheckCircle,
  Clock,
  Search,
  Download,
  ExternalLink,
  Eye,
  Key,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
} from "lucide-react";
import useWalletStore from "../store/wallet";
import apiService from "../services/api";
import Header from "../components/Header";
import ExtensionHeader from "../components/ExtensionHeader";
import NavigationHeader from "../components/NavigationHeader";
import PDFPreviewModal from "../components/PDFPreviewModal";
import { createDocTypeBadge } from "../utils/documentTypeConfig";

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
  const [previewDoc, setPreviewDoc] = useState(null); // { title, pdfUrl, docId }
  const [expandedKeys, setExpandedKeys] = useState({}); // Track which document keys are expanded

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
      doc.issuer?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getDocumentTypeBadge = (docType) => {
    const badge = createDocTypeBadge(docType, true);
    return (
      <span
        className={`px-2 py-1 text-xs font-medium ${badge.colorClass} rounded-full inline-flex items-center gap-1`}
      >
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  const handleViewPDF = (doc) => {
    // Prefer displayCid (with QR code) over canonicalCid
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
    });
    if (pdfCid) {
      setPreviewDoc({
        title: doc.title,
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
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950">
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
                <FileText className="text-primary-400" size={32} />
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
                <CheckCircle className="text-secondary-400" size={32} />
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
                <Shield className="text-secondary-500" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">My Documents</h2>
            <div className="relative w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Clock
                className="animate-spin text-primary-400 mx-auto mb-4"
                size={32}
              />
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
              {/* Table Layout */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-primary-400 uppercase tracking-wide">
                        Document
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-primary-400 uppercase tracking-wide">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-primary-400 uppercase tracking-wide">
                        Issuer
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-primary-400 uppercase tracking-wide">
                        Issued
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-primary-400 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <>
                        <tr
                          key={doc.id || doc.docId}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="text-white font-medium">
                              {doc.title}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getDocumentTypeBadge(doc.docType)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white font-medium">
                              {doc.issuer || doc.batch?.issuer || "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-gray-300 text-sm">
                              {doc.issuedAt
                                ? new Date(doc.issuedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )
                                : "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewPDF(doc)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-secondary-500/20 hover:bg-secondary-500/30 border border-secondary-500/30 rounded-lg text-secondary-400 text-sm transition-all"
                                title="View PDF"
                              >
                                <Eye size={14} />
                                <span className="hidden sm:inline">View</span>
                              </button>
                              {doc.verification?.verifyUrl && (
                                <a
                                  href={doc.verification.verifyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 rounded-lg text-primary-400 text-sm transition-all"
                                  title="Verify"
                                >
                                  <Shield size={14} />
                                  <span className="hidden sm:inline">
                                    Verify
                                  </span>
                                </a>
                              )}
                              {doc.type === "BATCH_DOCUMENT" && doc.docId && (
                                <button
                                  onClick={() =>
                                    setExpandedKeys((prev) => ({
                                      ...prev,
                                      [doc.docId]: !prev[doc.docId],
                                    }))
                                  }
                                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm transition-all"
                                  title="Access Keys"
                                >
                                  <Key size={14} />
                                  <span className="hidden sm:inline">Keys</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {/* Access Keys Row - Expanded */}
                        {doc.type === "BATCH_DOCUMENT" &&
                          doc.docId &&
                          expandedKeys[doc.docId] && (
                            <tr key={`${doc.id || doc.docId}-keys`}>
                              <td
                                colSpan="5"
                                className="py-0 px-4 bg-white/[0.02]"
                              >
                                <div className="py-4">
                                  <DocumentKeyManager
                                    docId={doc.docId}
                                    expanded={true}
                                    onToggle={() =>
                                      setExpandedKeys((prev) => ({
                                        ...prev,
                                        [doc.docId]: !prev[doc.docId],
                                      }))
                                    }
                                  />
                                </div>
                              </td>
                            </tr>
                          )}
                      </>
                    ))}
                  </tbody>
                </table>
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

// Document Key Manager Component
const DocumentKeyManager = ({ docId, expanded, onToggle }) => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);

  useEffect(() => {
    if (expanded && keys.length === 0) {
      fetchKeys();
    }
  }, [expanded, docId]);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDocumentKeys(docId);
      setKeys(response.keys || []);
    } catch (error) {
      console.error("Failed to fetch keys:", error);
      showToast.error("Failed to load access keys");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    try {
      setLoading(true);
      const response = await apiService.generateDocumentKey(docId);
      setKeys([...keys, response.key]);
      showToast.success("New access key generated!");
    } catch (error) {
      console.error("Failed to generate key:", error);
      showToast.error("Failed to generate access key");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (key) => {
    if (keys.length <= 1) {
      showToast.error("Cannot delete the last key");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this access key? Links using this key will stop working.",
      )
    ) {
      return;
    }

    try {
      setDeletingKey(key);
      await apiService.deleteDocumentKey(docId, key);
      setKeys(keys.filter((k) => k.key !== key));
      showToast.success("Access key deleted");
    } catch (error) {
      console.error("Failed to delete key:", error);
      showToast.error(
        error.response?.data?.message || "Failed to delete access key",
      );
    } finally {
      setDeletingKey(null);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getShareableLink = (key) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/verify?doc=${docId}&key=${key}`;
  };

  return (
    <div className="space-y-3">
      {loading && keys.length === 0 ? (
        <div className="text-center py-4">
          <Clock
            className="animate-spin text-gray-400 mx-auto mb-2"
            size={20}
          />
          <p className="text-gray-400 text-sm">Loading keys...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-primary-400" />
              <span className="text-sm font-medium text-white">
                Access Keys ({keys.length})
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {keys.map((keyData, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key size={14} className="text-secondary-400" />
                    <span className="text-xs font-medium text-gray-300">
                      {keyData.isIssuerKey
                        ? "Issuer Key"
                        : `Holder Key #${index}`}
                    </span>
                  </div>
                  {!keyData.isIssuerKey && (
                    <button
                      onClick={() => handleDeleteKey(keyData.key)}
                      disabled={deletingKey === keyData.key || keys.length <= 1}
                      className="p-1 text-accent-400 hover:text-accent-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Delete key"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <code className="flex-1 text-xs bg-black/20 px-2 py-1 rounded text-gray-400 font-mono">
                    {keyData.truncated}
                  </code>
                  <button
                    onClick={() => copyToClipboard(keyData.key, keyData.key)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Copy full key"
                  >
                    {copiedKey === keyData.key ? (
                      <CheckCircle size={14} className="text-secondary-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <button
                  onClick={() =>
                    copyToClipboard(
                      getShareableLink(keyData.key),
                      `link-${keyData.key}`,
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-secondary-500/20 hover:bg-secondary-500/30 border border-secondary-500/30 rounded-lg text-secondary-400 text-xs transition-all"
                >
                  {copiedKey === `link-${keyData.key}` ? (
                    <>
                      <CheckCircle size={14} />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <LinkIcon size={14} />
                      Copy Share Link
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerateKey}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 rounded-lg text-primary-400 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Generate New Key
          </button>
        </>
      )}
    </div>
  );
};

export default HolderDashboard;
