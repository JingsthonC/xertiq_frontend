import React, { useState, useEffect } from "react";
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
  EyeOff,
  Key,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  X,
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
  const [visibilityModal, setVisibilityModal] = useState(null); // { docId, title, currentlyVisible }
  const [visibilityNote, setVisibilityNote] = useState("");
  const [togglingVisibility, setTogglingVisibility] = useState(null);

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

  const handleVisibilityToggle = async (doc) => {
    const isCurrentlyVisible = doc.visibility?.isVisible ?? true;

    // If currently visible and user wants to hide, show modal for optional note
    if (isCurrentlyVisible) {
      setVisibilityModal({
        docId: doc.docId,
        title: doc.title,
        currentlyVisible: true,
      });
      setVisibilityNote("");
      return;
    }

    // If hidden, directly make visible (no note needed)
    await toggleVisibility(doc.docId, true, null);
  };

  const toggleVisibility = async (docId, isVisible, note) => {
    try {
      setTogglingVisibility(docId);
      await apiService.toggleDocumentVisibility(docId, isVisible, note);

      // Update local state immediately
      setDocuments((prevDocs) =>
        prevDocs.map((doc) =>
          doc.docId === docId
            ? {
                ...doc,
                visibility: {
                  isVisible,
                  note: isVisible ? null : note,
                  changedAt: new Date().toISOString(),
                },
              }
            : doc,
        ),
      );

      showToast.success(
        isVisible
          ? "Document is now visible to verifiers"
          : "Document is now hidden from verifiers",
      );
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      showToast.error(
        error.response?.data?.message || "Failed to update visibility",
      );
    } finally {
      setTogglingVisibility(null);
      setVisibilityModal(null);
    }
  };

  const handleHideDocument = () => {
    if (visibilityModal) {
      toggleVisibility(visibilityModal.docId, false, visibilityNote || null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {isExt ? <ExtensionHeader /> : <Header />}
      {!isExt && <NavigationHeader />}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Total Documents</p>
                  <p className="text-3xl font-bold text-[#1E40AF]">
                    {stats.totalDocuments || 0}
                  </p>
                </div>
                <FileText className="text-[#3B82F6]" size={32} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Batch Documents</p>
                  <p className="text-3xl font-bold text-[#1E40AF]">
                    {stats.totalBatchDocuments || 0}
                  </p>
                </div>
                <CheckCircle className="text-[#8B5CF6]" size={32} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Certificates</p>
                  <p className="text-3xl font-bold text-[#1E40AF]">
                    {stats.totalCertificates || 0}
                  </p>
                </div>
                <Shield className="text-[#7C3AED]" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1E40AF]">My Documents</h2>
            <div className="relative w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Clock
                className="animate-spin text-[#3B82F6] mx-auto mb-4"
                size={32}
              />
              <p className="text-slate-500">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="text-slate-300 mx-auto mb-4" size={48} />
              <p className="text-slate-600 text-lg">No documents found</p>
              <p className="text-slate-400 text-sm mt-2">
                Documents issued to you will appear here
              </p>
            </div>
          ) : (
            <>
              {/* Table Layout */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#3B82F6] uppercase tracking-wide">
                        Document
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#3B82F6] uppercase tracking-wide">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#3B82F6] uppercase tracking-wide">
                        Issuer
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#3B82F6] uppercase tracking-wide">
                        Issued
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#3B82F6] uppercase tracking-wide">
                        Visibility
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#3B82F6] uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <React.Fragment key={doc.id || doc.docId}>
                        <tr
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="text-[#1E40AF] font-medium">
                              {doc.title}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getDocumentTypeBadge(doc.docType)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-700 font-medium">
                              {doc.issuer || doc.batch?.issuer || "N/A"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-500 text-sm">
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
                            {doc.type === "BATCH_DOCUMENT" ? (
                              <button
                                onClick={() => handleVisibilityToggle(doc)}
                                disabled={togglingVisibility === doc.docId}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all ${
                                  (doc.visibility?.isVisible ?? true)
                                    ? "bg-green-50 hover:bg-green-100 border border-green-200 text-green-700"
                                    : "bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700"
                                } ${togglingVisibility === doc.docId ? "opacity-50 cursor-not-allowed" : ""}`}
                                title={
                                  (doc.visibility?.isVisible ?? true)
                                    ? "Document is visible to verifiers - Click to hide"
                                    : "Document is hidden from verifiers - Click to show"
                                }
                              >
                                {togglingVisibility === doc.docId ? (
                                  <Clock className="animate-spin" size={14} />
                                ) : (doc.visibility?.isVisible ?? true) ? (
                                  <Eye size={14} />
                                ) : (
                                  <EyeOff size={14} />
                                )}
                                <span className="hidden sm:inline">
                                  {(doc.visibility?.isVisible ?? true)
                                    ? "Visible"
                                    : "Hidden"}
                                </span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewPDF(doc)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 rounded-lg text-[#7C3AED] text-sm transition-all"
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
                                  className="flex items-center gap-1 px-3 py-1.5 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/30 rounded-lg text-[#3B82F6] text-sm transition-all"
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
                                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-600 text-sm transition-all"
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
                            <tr>
                              <td
                                colSpan="5"
                                className="py-0 px-4 bg-slate-50"
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
                      </React.Fragment>
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
                    className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200"
                  >
                    Previous
                  </button>
                  <span className="text-slate-500">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    disabled={page === pagination.pages}
                    className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200"
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

      {/* Visibility Toggle Modal */}
      {visibilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <EyeOff className="text-amber-500" size={20} />
                <h3 className="text-lg font-semibold text-slate-800">
                  Hide Document
                </h3>
              </div>
              <button
                onClick={() => setVisibilityModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <p className="text-slate-600 mb-4">
                You are about to hide{" "}
                <span className="font-medium text-slate-800">
                  {visibilityModal.title}
                </span>{" "}
                from verification. Verifiers will see a "Document not available"
                message.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason (optional, private to you)
                </label>
                <textarea
                  value={visibilityNote}
                  onChange={(e) => setVisibilityNote(e.target.value)}
                  placeholder="e.g., Document expired, Requesting replacement..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">
                  {visibilityNote.length}/500
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> You can make this document visible again
                  at any time.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setVisibilityModal(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleHideDocument}
                disabled={togglingVisibility}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {togglingVisibility ? (
                  <Clock className="animate-spin" size={16} />
                ) : (
                  <EyeOff size={16} />
                )}
                Hide Document
              </button>
            </div>
          </div>
        </div>
      )}
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
            className="animate-spin text-[#3B82F6] mx-auto mb-2"
            size={20}
          />
          <p className="text-slate-500 text-sm">Loading keys...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-[#3B82F6]" />
              <span className="text-sm font-medium text-slate-700">
                Access Keys ({keys.length})
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {keys.map((keyData, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key size={14} className="text-[#8B5CF6]" />
                    <span className="text-xs font-medium text-slate-600">
                      {keyData.isIssuerKey
                        ? "Issuer Key"
                        : `Holder Key #${index}`}
                    </span>
                  </div>
                  {!keyData.isIssuerKey && (
                    <button
                      onClick={() => handleDeleteKey(keyData.key)}
                      disabled={deletingKey === keyData.key || keys.length <= 1}
                      className="p-1 text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Delete key"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <code className="flex-1 text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                    {keyData.truncated}
                  </code>
                  <button
                    onClick={() => copyToClipboard(keyData.key, keyData.key)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Copy full key"
                  >
                    {copiedKey === keyData.key ? (
                      <CheckCircle size={14} className="text-green-500" />
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
                  className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 rounded-lg text-[#7C3AED] text-xs transition-all"
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/30 rounded-lg text-[#3B82F6] text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
