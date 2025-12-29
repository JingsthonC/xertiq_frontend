import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  FileText,
  User,
  Hash,
  Search,
  Loader,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import apiService from "../services/api";

const Verify = () => {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check URL parameters for auto-verification
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get("doc");
    const hash = urlParams.get("hash");

    if (docId || hash) {
      handleVerification(docId || hash);
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
      // Call the verification API using our API service
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Mobile-First Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <Shield size={32} className="text-white sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
            Document Verification
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Verify blockchain-secured documents instantly
          </p>
        </div>

        {/* Mobile-First Search Form */}
        {Object.keys(verificationData || {}).length === 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Document ID or Hash
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-sm sm:text-base"
                    placeholder="Enter document ID or verification hash..."
                  />
                  <button
                    type="submit"
                    disabled={loading || !searchQuery.trim()}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        <span>Verify</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/40 rounded-2xl p-4 mb-6 sm:mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle
                size={20}
                className="text-red-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-red-300 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Verification Results */}
        {verificationData && (
          <div className="space-y-4 sm:space-y-6">
            {/* Status Header - Mobile First */}
            <div
              className={`bg-gradient-to-r ${
                verificationData.valid
                  ? "from-green-500/10 to-emerald-500/10 border-green-400/40"
                  : "from-red-500/10 to-red-500/10 border-red-400/40"
              } border rounded-2xl p-4 sm:p-6`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-3">
                  {verificationData.valid ? (
                    <CheckCircle
                      size={28}
                      className="text-green-400 flex-shrink-0"
                    />
                  ) : (
                    <AlertCircle
                      size={28}
                      className="text-red-400 flex-shrink-0"
                    />
                  )}
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {verificationData.valid
                        ? "Document Verified"
                        : "Verification Failed"}
                    </h2>
                    <p
                      className={`text-sm sm:text-base ${
                        verificationData.valid
                          ? "text-green-300"
                          : "text-red-300"
                      }`}
                    >
                      {verificationData.valid
                        ? "This document is authentic and secured on blockchain"
                        : "This document could not be verified"}
                    </p>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-400 sm:ml-auto">
                  Verified: {new Date().toLocaleString()}
                </div>
              </div>
            </div>

            {/* Holder Information - Mobile Responsive */}
            {verificationData.valid && verificationData.holder && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <User size={20} className="text-purple-400" />
                  <span>Holder Information</span>
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">
                      Holder Name
                    </p>
                    <p className="text-white text-sm sm:text-base font-medium">
                      {verificationData.holder.name}
                    </p>
                  </div>

                  {verificationData.holder.email && (
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-400 mb-1">
                        Email
                      </p>
                      <p className="text-white text-sm sm:text-base break-all">
                        {verificationData.holder.email}
                      </p>
                    </div>
                  )}

                  {verificationData.holder.position && (
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/40 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-400 mb-1">
                        Document Position
                      </p>
                      <p className="text-white text-base sm:text-lg font-bold">
                        {verificationData.holder.position.display}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Information - Mobile Responsive */}
            {verificationData.valid && verificationData.document && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <FileText size={20} className="text-blue-400" />
                  <span>Document Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {verificationData.document.student_name && (
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-400 mb-1">
                        Student Name
                      </p>
                      <p className="text-white text-sm sm:text-base font-medium">
                        {verificationData.document.student_name}
                      </p>
                    </div>
                  )}
                  {verificationData.document.email && (
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-400 mb-1">
                        Email
                      </p>
                      <p className="text-white text-sm sm:text-base break-all">
                        {verificationData.document.email}
                      </p>
                    </div>
                  )}
                  {verificationData.document.birthday && (
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-400 mb-1">
                        Birthday
                      </p>
                      <p className="text-white text-sm sm:text-base">
                        {verificationData.document.birthday}
                      </p>
                    </div>
                  )}
                  {verificationData.document.gender && (
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-400 mb-1">
                        Gender
                      </p>
                      <p className="text-white text-sm sm:text-base capitalize">
                        {verificationData.document.gender}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Merkle Hashes - Mobile Responsive */}
            {verificationData.merkleHashes && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Hash size={20} className="text-green-400" />
                  <span>Merkle Hashes</span>
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  {verificationData.merkleHashes.personal && (
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs sm:text-sm text-gray-400">
                          Personal Merkle Hash
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              verificationData.merkleHashes.personal
                            )
                          }
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          {copied ? (
                            <Check size={14} className="text-green-400" />
                          ) : (
                            <Copy size={14} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-white font-mono text-xs sm:text-sm break-all">
                        {verificationData.merkleHashes.personal}
                      </p>
                    </div>
                  )}

                  {verificationData.merkleHashes.root && (
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs sm:text-sm text-gray-400">
                          Root Merkle Hash
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              verificationData.merkleHashes.root
                            )
                          }
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          {copied ? (
                            <Check size={14} className="text-green-400" />
                          ) : (
                            <Copy size={14} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-white font-mono text-xs sm:text-sm break-all">
                        {verificationData.merkleHashes.root}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Blockchain Information - Mobile Responsive */}
            {verificationData.verification && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Hash size={20} className="text-orange-400" />
                  <span>Blockchain Information</span>
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  {verificationData.verification.blockchain_network && (
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-400 mb-1">
                        Network
                      </p>
                      <p className="text-white text-sm sm:text-base font-medium">
                        {verificationData.verification.blockchain_network}
                      </p>
                    </div>
                  )}

                  {verificationData.verification.transaction_signature && (
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs sm:text-sm text-gray-400">
                          Transaction Signature
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              verificationData.verification
                                .transaction_signature
                            )
                          }
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          {copied ? (
                            <Check size={14} className="text-green-400" />
                          ) : (
                            <Copy size={14} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-white font-mono text-xs sm:text-sm break-all">
                        {verificationData.verification.transaction_signature}
                      </p>
                    </div>
                  )}

                  {verificationData.verification.explorer_url && (
                    <div className="pt-2">
                      <a
                        href={verificationData.verification.explorer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-xl px-4 py-3 text-blue-300 transition-colors text-sm sm:text-base font-medium w-full sm:w-auto justify-center sm:justify-start"
                      >
                        <ExternalLink size={16} />
                        <span>View on Blockchain Explorer</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Steps - Mobile Responsive */}
            {verificationData.verification?.steps && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Shield size={20} className="text-purple-400" />
                  <span>Verification Process</span>
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  {verificationData.verification.steps.map((step, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-xl p-3 sm:p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            step.status === "valid"
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {step.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-white font-semibold text-sm sm:text-base">
                              {step.name}
                            </h4>
                            {step.status === "valid" ? (
                              <CheckCircle
                                size={16}
                                className="text-green-400 flex-shrink-0 ml-2"
                              />
                            ) : (
                              <AlertCircle
                                size={16}
                                className="text-red-400 flex-shrink-0 ml-2"
                              />
                            )}
                          </div>
                          <p
                            className={`text-xs sm:text-sm ${
                              step.status === "valid"
                                ? "text-green-300"
                                : "text-red-300"
                            }`}
                          >
                            {step.details?.message ||
                              (step.status === "valid"
                                ? "Verification successful"
                                : "Verification failed")}
                          </p>

                          {/* Step Details */}
                          {step.details && (
                            <div className="mt-2 space-y-2">
                              {step.details.merkleRoot && (
                                <div className="text-xs">
                                  <p className="text-gray-400">Merkle Root:</p>
                                  <p className="text-white font-mono break-all">
                                    {step.details.merkleRoot}
                                  </p>
                                </div>
                              )}
                              {step.details.explorerUrl && (
                                <a
                                  href={step.details.explorerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-xs"
                                >
                                  <ExternalLink size={12} />
                                  <span>View Details</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary - Mobile Responsive */}
            {verificationData.verification?.summary && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                  Verification Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { key: "identityHashValid", label: "Identity Hash" },
                    { key: "merkleProofValid", label: "Merkle Proof" },
                    { key: "blockchainValid", label: "Blockchain" },
                    { key: "overallValid", label: "Overall Status" },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-white/5 rounded-xl p-3"
                    >
                      <span className="text-gray-300 text-sm">{label}:</span>
                      <div className="flex items-center space-x-2">
                        {verificationData.verification.summary[key] ? (
                          <CheckCircle size={16} className="text-green-400" />
                        ) : (
                          <AlertCircle size={16} className="text-red-400" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            verificationData.verification.summary[key]
                              ? "text-green-300"
                              : "text-red-300"
                          }`}
                        >
                          {verificationData.verification.summary[key]
                            ? "Valid"
                            : "Invalid"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Access - Mobile Responsive */}
            {verificationData.access && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                  Document Access
                </h3>
                <div className="space-y-3">
                  {verificationData.access.canonicalDocument && (
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-400 mb-2">
                        Canonical Document (IPFS)
                      </p>
                      <a
                        href={verificationData.access.canonicalDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm break-all"
                      >
                        {verificationData.access.canonicalDocument}
                      </a>
                    </div>
                  )}
                  {verificationData.access.displayDocument &&
                    verificationData.access.displayDocument !== "null" && (
                      <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-400 mb-2">
                          Display Document
                        </p>
                        <a
                          href={verificationData.access.displayDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm break-all"
                        >
                          {verificationData.access.displayDocument}
                        </a>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 py-4">
          <p className="text-gray-400 text-xs sm:text-sm">
            Powered by XertiQ Blockchain Verification
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
