import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  FileText,
  User,
  Calendar,
  Hash,
  Globe,
  Search,
  Loader,
} from "lucide-react";
import Header from "../components/Header";
import NavigationHeader from "../components/NavigationHeader";
import apiService from "../services/api";

const Verify = () => {
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

  // Verify page should always be in web mode for better document viewing
  const isExt = false; // Force web mode for verification page

  if (isExt) {
    return (
      <div className="h-full bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23] text-white overflow-hidden flex flex-col">
        <NavigationHeader title="Verify Document" />

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Compact Search Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Enter document ID or hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors font-semibold"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span className="text-sm">Verifying...</span>
                </>
              ) : (
                <>
                  <Shield size={16} />
                  <span className="text-sm">Verify Document</span>
                </>
              )}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/40 rounded-xl p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Compact Verification Results */}
          {verificationData && (
            <div className="space-y-3">
              {/* Status */}
              <div
                className={`rounded-xl p-3 border ${
                  verificationData.valid
                    ? "bg-green-500/10 border-green-400/40"
                    : "bg-red-500/10 border-red-400/40"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {verificationData.valid ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : (
                    <AlertCircle size={20} className="text-red-400" />
                  )}
                  <div>
                    <p
                      className={`font-bold text-sm ${
                        verificationData.valid
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {verificationData.valid
                        ? "Document Verified"
                        : "Verification Failed"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {verificationData.valid
                        ? "Authentic blockchain certificate"
                        : "Document not found"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Info - Compact */}
              {verificationData.valid && verificationData.document && (
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
                  <h3 className="text-sm font-bold text-white mb-2">
                    Document Details
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Student</p>
                      <p className="text-white text-sm font-medium">
                        {verificationData.document.student_name}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-white text-sm">
                        {verificationData.document.email}
                      </p>
                    </div>
                    {verificationData.document.birthday && (
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Birthday</p>
                        <p className="text-white text-sm">
                          {verificationData.document.birthday}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Blockchain Info - Compact */}
              {verificationData.verification && (
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
                  <h3 className="text-sm font-bold text-white mb-2">
                    Blockchain Details
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Network</p>
                      <p className="text-white text-sm">
                        {verificationData.verification.blockchain_network}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Transaction</p>
                      <p className="text-white text-xs font-mono truncate">
                        {verificationData.verification.transaction_signature}
                      </p>
                    </div>
                    {verificationData.verification.explorer_url && (
                      <a
                        href={verificationData.verification.explorer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-lg px-2 py-1 text-blue-300 transition-colors text-xs"
                      >
                        <ExternalLink size={12} />
                        <span>View on Explorer</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23]">
      <Header />

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Document Verification
                </h1>
                <p className="text-gray-300">
                  Verify blockchain-secured documents instantly
                </p>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Document ID or Hash
                </label>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none"
                    placeholder="Enter document ID or verification hash..."
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
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

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/40 rounded-xl p-4 mb-8">
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-400" />
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Verification Results */}
          {verificationData && (
            <div className="space-y-6">
              {/* Status Header */}
              <div
                className={`bg-gradient-to-r ${
                  verificationData.valid
                    ? "from-green-500/10 to-emerald-500/10 border-green-400/40"
                    : "from-red-500/10 to-red-500/10 border-red-400/40"
                } border rounded-2xl p-6`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  {verificationData.valid ? (
                    <CheckCircle size={32} className="text-green-400" />
                  ) : (
                    <AlertCircle size={32} className="text-red-400" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {verificationData.valid
                        ? "Document Verified"
                        : "Verification Failed"}
                    </h2>
                    <p
                      className={`${
                        verificationData.valid
                          ? "text-green-300"
                          : "text-red-300"
                      }`}
                    >
                      {verificationData.valid
                        ? "This document is authentic and secured on blockchain"
                        : "This document could not be verified"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Verified at:{" "}
                      {new Date(verificationData.verifiedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <FileText size={24} className="text-blue-400" />
                  <span>Document Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Document ID</p>
                    <p className="text-white font-mono text-sm break-all">
                      {verificationData.docId}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Title</p>
                    <p className="text-white">
                      {verificationData.document?.title}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Student Name</p>
                    <p className="text-white">
                      {verificationData.document?.studentName}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Document Type</p>
                    <p className="text-white capitalize">
                      {verificationData.document?.docType}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Issued By</p>
                    <p className="text-white">
                      {verificationData.document?.issuer}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Issued At</p>
                    <p className="text-white">
                      {verificationData.document?.issuedAt
                        ? new Date(
                            verificationData.document.issuedAt
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Steps */}
              {verificationData.verification?.steps && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Hash size={24} className="text-orange-400" />
                    <span>Verification Process</span>
                  </h3>

                  <div className="space-y-4">
                    {verificationData.verification.steps.map((step, index) => (
                      <div key={index} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              step.status === "valid"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">
                              {step.name}
                            </h4>
                            <p
                              className={`text-sm ${
                                step.status === "valid"
                                  ? "text-green-300"
                                  : "text-red-300"
                              }`}
                            >
                              {step.details?.message}
                            </p>
                          </div>
                          {step.status === "valid" ? (
                            <CheckCircle size={20} className="text-green-400" />
                          ) : (
                            <AlertCircle size={20} className="text-red-400" />
                          )}
                        </div>

                        {/* Step Details */}
                        {step.details && (
                          <div className="mt-3 pl-11 space-y-2">
                            {step.details.expected && step.details.computed && (
                              <div className="text-xs">
                                <p className="text-gray-400">
                                  Hash Verification:
                                </p>
                                <p className="text-white font-mono break-all">
                                  Expected: {step.details.expected}
                                </p>
                                <p className="text-white font-mono break-all">
                                  Computed: {step.details.computed}
                                </p>
                              </div>
                            )}
                            {step.details.merkleRoot && (
                              <div className="text-xs">
                                <p className="text-gray-400">Merkle Root:</p>
                                <p className="text-white font-mono break-all">
                                  {step.details.merkleRoot}
                                </p>
                              </div>
                            )}
                            {step.details.txSig && (
                              <div className="text-xs">
                                <p className="text-gray-400">Transaction:</p>
                                <p className="text-white font-mono break-all">
                                  {step.details.txSig}
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
                                <span>View on Explorer</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Verification Summary */}
                  {verificationData.verification.summary && (
                    <div className="mt-6 bg-white/5 rounded-xl p-4">
                      <h4 className="text-white font-semibold mb-3">
                        Verification Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Identity Hash:</span>
                          {verificationData.verification.summary
                            .identityHashValid ? (
                            <CheckCircle size={16} className="text-green-400" />
                          ) : (
                            <AlertCircle size={16} className="text-red-400" />
                          )}
                          <span
                            className={
                              verificationData.verification.summary
                                .identityHashValid
                                ? "text-green-300"
                                : "text-red-300"
                            }
                          >
                            {verificationData.verification.summary
                              .identityHashValid
                              ? "Valid"
                              : "Invalid"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Merkle Proof:</span>
                          {verificationData.verification.summary
                            .merkleProofValid ? (
                            <CheckCircle size={16} className="text-green-400" />
                          ) : (
                            <AlertCircle size={16} className="text-red-400" />
                          )}
                          <span
                            className={
                              verificationData.verification.summary
                                .merkleProofValid
                                ? "text-green-300"
                                : "text-red-300"
                            }
                          >
                            {verificationData.verification.summary
                              .merkleProofValid
                              ? "Valid"
                              : "Invalid"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Blockchain:</span>
                          {verificationData.verification.summary
                            .blockchainValid ? (
                            <CheckCircle size={16} className="text-green-400" />
                          ) : (
                            <AlertCircle size={16} className="text-red-400" />
                          )}
                          <span
                            className={
                              verificationData.verification.summary
                                .blockchainValid
                                ? "text-green-300"
                                : "text-red-300"
                            }
                          >
                            {verificationData.verification.summary
                              .blockchainValid
                              ? "Valid"
                              : "Invalid"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Overall:</span>
                          {verificationData.verification.summary
                            .overallValid ? (
                            <CheckCircle size={16} className="text-green-400" />
                          ) : (
                            <AlertCircle size={16} className="text-red-400" />
                          )}
                          <span
                            className={
                              verificationData.verification.summary.overallValid
                                ? "text-green-300"
                                : "text-red-300"
                            }
                          >
                            {verificationData.verification.summary.overallValid
                              ? "Valid"
                              : "Invalid"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Identity Information */}
              {verificationData.document?.identity && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <User size={24} className="text-purple-400" />
                    <span>Identity Information</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Email</p>
                      <p className="text-white">
                        {verificationData.document.identity.email}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Birthday</p>
                      <p className="text-white">
                        {verificationData.document.identity.birthday}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Gender</p>
                      <p className="text-white capitalize">
                        {verificationData.document.identity.gender}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 md:col-span-3">
                      <p className="text-sm text-gray-400 mb-1">
                        Identity String
                      </p>
                      <p className="text-white font-mono text-sm break-all">
                        {verificationData.document.identity.identityString}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Blockchain Information */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Hash size={24} className="text-orange-400" />
                  <span>Blockchain Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Merkle Hash</p>
                    <p className="text-white font-mono text-xs break-all">
                      {verificationData.technical?.merkleHash}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Batch ID</p>
                    <p className="text-white font-mono text-sm">
                      {verificationData.batch?.batchId}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Merkle Root</p>
                    <p className="text-white font-mono text-xs break-all">
                      {verificationData.batch?.merkleRoot}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">
                      Transaction Signature
                    </p>
                    <p className="text-white font-mono text-xs break-all">
                      {verificationData.technical?.txSig}
                    </p>
                  </div>
                </div>

                {verificationData.access?.blockchainExplorer && (
                  <a
                    href={verificationData.access.blockchainExplorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-lg px-4 py-2 text-blue-300 transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span>View on Solana Explorer</span>
                  </a>
                )}
              </div>

              {/* Batch Information */}
              {verificationData.batch && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Globe size={24} className="text-green-400" />
                    <span>Batch Information</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Batch ID</p>
                      <p className="text-white font-mono text-sm">
                        {verificationData.batch.batchId}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">
                        Document Count
                      </p>
                      <p className="text-white">
                        {verificationData.batch.documentCount}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Created At</p>
                      <p className="text-white">
                        {new Date(
                          verificationData.batch.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Access Links */}
              {verificationData.access && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Document Access
                  </h3>
                  <div className="space-y-3">
                    {verificationData.access.canonicalDocument && (
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-2">
                          Canonical Document (IPFS)
                        </p>
                        <a
                          href={verificationData.access.canonicalDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm break-all"
                        >
                          {verificationData.access.canonicalDocument}
                        </a>
                      </div>
                    )}
                    {verificationData.access.displayDocument &&
                      verificationData.access.displayDocument !== "null" && (
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-sm text-gray-400 mb-2">
                            Display Document
                          </p>
                          <a
                            href={verificationData.access.displayDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm break-all"
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
        </div>
      </div>
    </div>
  );
};

export default Verify;
