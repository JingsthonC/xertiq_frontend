import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  FileText,
  Hash,
  Search,
  Loader,
  Copy,
  Check,
  GraduationCap,
} from "lucide-react";
import apiService from "../services/api";

/**
 * Embeddable Verification Widget
 * Can be embedded in third-party websites via iframe
 * Compact, focused verification UI with XertiQ branding
 * 
 * Usage in iframe:
 * <iframe src="https://xertiq-frontend.vercel.app/embed/verify" width="100%" height="700"></iframe>
 * 
 * With auto-verification:
 * <iframe src="https://xertiq-frontend.vercel.app/embed/verify?doc=YOUR_DOC_ID" width="100%" height="700"></iframe>
 */
const EmbeddableVerify = () => {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check URL parameters for auto-verification
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get("doc");
    const hash = urlParams.get("hash");

    if (docId || hash) {
      handleVerification(docId || hash);
      setSearchQuery(docId || hash);
    }

    // Notify parent iframe (if embedded) that widget is loaded
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'xertiq-widget-loaded' }, '*');
    }
  }, []);

  const handleVerification = async (query) => {
    if (!query) {
      setError("Please enter a document ID or hash");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiService.verifyDocument(query);

      if (data.valid) {
        setVerificationData(data);
      } else {
        setError("Document not found or invalid");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setError("Failed to verify document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerification(searchQuery);
  };

  return (
    <div className="min-h-screen bg-light p-3 sm:p-4">
      <div className="max-w-3xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-dark rounded-xl mb-3 shadow-md">
            <Shield size={24} className="text-lightest sm:w-7 sm:h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark mb-1">
            Document Verification
          </h1>
          <p className="text-dark text-xs sm:text-sm">
            Verify blockchain-secured documents
          </p>
        </div>

        {/* Search Form */}
        {!verificationData && (
          <div className="bg-white border border-light rounded-xl p-4 sm:p-5 mb-4 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Document ID or Hash
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-lightest border-2 border-light rounded-lg px-3 py-2 text-gray-900 placeholder-medium focus:ring-2 focus:ring-dark/40 focus:border-dark outline-none text-sm"
                    placeholder="Enter document ID or hash..."
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-dark hover:bg-darker text-lightest px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[120px]"
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        <span className="text-sm">Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Search size={16} />
                        <span className="text-sm">Verify</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-error-bg border border-error-border rounded-xl p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle
                size={20}
                className="text-error flex-shrink-0 mt-0.5"
              />
              <div>
                <h3 className="text-sm font-semibold text-error mb-1">
                  Verification Failed
                </h3>
                <p className="text-sm text-error/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Result - Compact */}
        {verificationData && (
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Status Header */}
              <div
                className={`p-4 ${
                  verificationData.valid ? "bg-success" : "bg-error"
                } text-lightest`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {verificationData.valid ? (
                    <CheckCircle size={20} className="flex-shrink-0" />
                  ) : (
                    <AlertCircle size={20} className="flex-shrink-0" />
                  )}
                  <h2 className="text-lg font-bold">
                    {verificationData.valid ? "✓ Verified" : "✗ Invalid"}
                  </h2>
                </div>
              </div>

              {/* Details */}
              {verificationData.valid && (
                <div className="p-4 sm:p-5">
                  {/* Holder Info */}
                  <div className="mb-4 text-center">
                    {verificationData.university?.logo && (
                      <img
                        src={verificationData.university.logo}
                        alt={verificationData.university.name}
                        className="w-16 h-16 object-contain mx-auto mb-2"
                      />
                    )}
                    <h3 className="text-lg font-bold text-gray-800">
                      {verificationData.holder?.name || "Certificate Holder"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {verificationData.document?.title || "Certificate"}
                    </p>
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {verificationData.holder?.dateIssued && (
                      <div className="bg-light rounded-lg p-3">
                        <p className="text-xs text-dark mb-1">Issued</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(
                            verificationData.holder.dateIssued
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {verificationData.document?.issuer && (
                      <div className="bg-light rounded-lg p-3">
                        <p className="text-xs text-dark mb-1">Issuer</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {verificationData.document.issuer}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Verification Status */}
                  {verificationData.verification?.summary && (
                    <div className="bg-success-bg rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { key: "identityHashValid", label: "Identity" },
                          { key: "merkleProofValid", label: "Merkle" },
                          { key: "blockchainValid", label: "Blockchain" },
                          { key: "overallValid", label: "Overall" },
                        ].map(({ key, label }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-600">{label}:</span>
                            <div className="flex items-center space-x-1">
                              {verificationData.verification.summary[key] ? (
                                <CheckCircle
                                  size={12}
                                  className="text-success"
                                />
                              ) : (
                                <AlertCircle size={12} className="text-error" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Link */}
                  {verificationData.access?.displayDocument && (
                    <a
                      href={verificationData.access.displayDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-light hover:bg-white border border-light rounded-lg p-3 transition-colors group mb-4"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-dark rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-lightest" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-darker">
                            View Document
                          </p>
                          <p className="text-xs text-gray-500">PDF File</p>
                        </div>
                      </div>
                      <ExternalLink
                        size={16}
                        className="text-gray-400 group-hover:text-dark"
                      />
                    </a>
                  )}

                  {/* Back Button */}
                  <button
                    onClick={() => {
                      setVerificationData(null);
                      setSearchQuery("");
                      setError("");
                    }}
                    className="w-full bg-dark/10 hover:bg-dark/20 border border-dark/40 rounded-lg px-4 py-2 text-darker transition-colors text-sm font-medium"
                  >
                    Verify Another Document
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Powered by XertiQ - Always Visible */}
        <div className="mt-6 text-center py-3">
          <div className="inline-flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-light">
            <Shield size={14} className="text-dark" />
            <span className="text-xs font-medium text-dark">Powered by:</span>
            <a
              href="https://xertiq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-darker hover:text-dark transition-colors"
            >
              XertiQ
            </a>
          </div>
          <p className="text-[10px] text-medium mt-2">
            Blockchain-Secured Document Verification
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmbeddableVerify;
