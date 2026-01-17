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
  Download,
  GraduationCap,
  Lock,
  Zap,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from "lucide-react";
import apiService from "../services/api";

const Verify = () => {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [showBatchTransaction, setShowBatchTransaction] = useState(false);
  const [showHolderTransaction, setShowHolderTransaction] = useState(false);

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
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#f7fafc] to-[#e6f2ff]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3834A8]/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00E5FF]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2A1B5D]/5 rounded-full blur-3xl"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Full-Screen Hero - Initial State */}
        {!verificationData && !loading && (
          <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            {/* Hero Header */}
            <div className="text-center mb-16 space-y-6">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-[#3834A8] to-[#2A1B5D] rounded-3xl shadow-2xl shadow-[#3834A8]/50 transform hover:scale-110 hover:rotate-3 transition-all duration-500">
                <Shield size={56} className="text-gray-800" />
              </div>
              <div>
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-4">
                  <span className="bg-gradient-to-r from-[#3834A8] to-[#00E5FF] bg-clip-text text-transparent">
                    XertiQ
                  </span>
                </h1>
                <p className="text-2xl sm:text-3xl text-gray-700 font-light mb-3">
                  Blockchain Document Verification
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <span className="flex items-center space-x-2">
                    <Zap size={16} className="text-yellow-500" />
                    <span>Instant</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-2">
                    <Shield size={16} className="text-green-500" />
                    <span>Free</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-2">
                    <Lock size={16} className="text-[#00E5FF]" />
                    <span>Tamper-Proof</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Flow - Full Width */}
            <div className="w-full max-w-7xl mb-16 px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {/* Organization Card */}
                <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 shadow-2xl transform hover:-translate-y-2 hover:shadow-[#3834A8]/20 transition-all duration-500">
                  <div className="flex flex-col items-center text-center space-y-6 h-full">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#3834A8] to-[#2A1B5D] rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                      <GraduationCap size={40} className="text-gray-800" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Organization
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Trusted Document Issuer
                      </p>
                    </div>
                    <div className="space-y-3 w-full flex-1 flex flex-col justify-center">
                      <div className="flex items-center space-x-3 bg-gray-50 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                        <CheckCircle
                          size={18}
                          className="text-green-500 flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Upload Documents
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 bg-gray-50 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                        <CheckCircle
                          size={18}
                          className="text-green-400 flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Generate Hash
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 bg-gray-50 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                        <CheckCircle
                          size={18}
                          className="text-green-400 flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Blockchain Anchor
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* XertiQ Platform Card */}
                <div className="group relative">
                  {/* Connection Lines */}
                  <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12">
                    <div className="w-12 h-1 bg-gradient-to-r from-transparent via-blue-400/50 to-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-12">
                    <div className="w-12 h-1 bg-gradient-to-r from-[#00E5FF] via-[#00E5FF]/50 to-transparent rounded-full animate-pulse"></div>
                  </div>

                  {/* Main Card */}
                  <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-600 rounded-3xl p-10 shadow-2xl shadow-blue-500/50 transform group-hover:scale-105 transition-all duration-500 border-2 border-white/30 h-full flex flex-col">
                    <div className="text-gray-800 text-center space-y-6 flex-1 flex flex-col justify-center">
                      <div className="flex justify-center">
                        <div className="relative">
                          <Shield
                            size={72}
                            className="drop-shadow-2xl animate-pulse"
                          />
                          <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl"></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-4xl font-black mb-2">XertiQ</h3>
                        <p className="text-blue-100 text-sm font-semibold">
                          Verification Engine
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white/25 backdrop-blur-md rounded-xl px-4 py-3 border border-white/30">
                          <div className="flex items-center justify-center space-x-3">
                            <Hash size={20} />
                            <span className="text-sm font-bold">Immutable</span>
                          </div>
                        </div>
                        <div className="bg-white/25 backdrop-blur-md rounded-xl px-4 py-3 border border-white/30">
                          <div className="flex items-center justify-center space-x-3">
                            <Shield size={20} />
                            <span className="text-sm font-bold">
                              Tamper-Proof
                            </span>
                          </div>
                        </div>
                        <div className="bg-white/25 backdrop-blur-md rounded-xl px-4 py-3 border border-white/30">
                          <div className="flex items-center justify-center space-x-3">
                            <CheckCircle size={20} />
                            <span className="text-sm font-bold">
                              Cryptographic
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Card */}
                <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 shadow-2xl transform hover:-translate-y-2 hover:shadow-teal-500/20 transition-all duration-500">
                  <div className="flex flex-col items-center text-center space-y-6 h-full">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                      <CheckCircle size={40} className="text-gray-800" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Verification
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Instant Validation Result
                      </p>
                    </div>
                    <div className="space-y-3 w-full flex-1 flex flex-col justify-center">
                      <div className="flex items-center space-x-3 bg-gray-50 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                        <CheckCircle
                          size={18}
                          className="text-[#00E5FF] flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Blockchain Verified
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 bg-gray-50 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                        <CheckCircle
                          size={18}
                          className="text-[#00E5FF] flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Merkle Proof Valid
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 bg-gray-50 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                        <CheckCircle
                          size={18}
                          className="text-[#00E5FF] flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Authentic Document
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar - Prominent */}
            <div className="w-full max-w-4xl px-4 mb-16">
              <form onSubmit={handleSubmit} className="relative group">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-500/20 border-2 border-white/40 p-2 flex items-center space-x-3 transform group-hover:scale-[1.02] group-hover:shadow-blue-500/40 transition-all duration-300">
                  <Search
                    size={32}
                    className="text-gray-400 ml-4 flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-xl py-5 px-2 font-medium"
                    placeholder="Enter Document ID or Hash..."
                  />
                  <button
                    type="submit"
                    disabled={!searchQuery.trim()}
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:via-indigo-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-800 px-10 py-5 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                  >
                    <span>Verify</span>
                    <Shield size={22} />
                  </button>
                </div>
              </form>

              {/* Error Display */}
              {error && (
                <div className="mt-6 bg-red-500/20 backdrop-blur-xl border-2 border-red-400/50 rounded-xl p-5 flex items-center space-x-4">
                  <AlertCircle
                    size={28}
                    className="text-red-300 flex-shrink-0"
                  />
                  <p className="text-red-100 font-semibold text-lg">{error}</p>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl w-full px-4">
              {[
                {
                  label: "Secure",
                  value: "100%",
                  gradient: "from-[#3834A8] to-[#2A1B5D]",
                },
                {
                  label: "Verification",
                  value: "Instant",
                  gradient: "from-[#00E5FF] to-[#00B8D4]",
                },
                {
                  label: "No Cost",
                  value: "Free",
                  gradient: "from-green-400 to-green-600",
                },
                {
                  label: "Available",
                  value: "24/7",
                  gradient: "from-[#3834A8] to-[#2A1B5D]",
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 backdrop-blur-xl rounded-2xl p-6 text-center border border-gray-200 shadow-lg transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <div className="text-center space-y-8">
              <div className="relative w-40 h-40 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3834A8] to-[#00E5FF] rounded-full animate-ping opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-600 rounded-full w-40 h-40 flex items-center justify-center shadow-2xl shadow-blue-500/50 border-4 border-white/30">
                  <Shield size={72} className="text-gray-800 animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-3">
                  Verifying...
                </h2>
                <p className="text-xl text-gray-600">
                  Checking blockchain records
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {verificationData && (
          <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
              {/* Back Button */}
              <button
                onClick={() => {
                  setVerificationData(null);
                  setSearchQuery("");
                  setError("");
                }}
                className="mb-8 inline-flex items-center space-x-3 text-gray-800 hover:text-blue-300 font-semibold text-lg transition-colors bg-gray-50 backdrop-blur-sm px-6 py-4 rounded-xl border border-gray-200 hover:bg-white/20"
              >
                <ArrowLeft size={24} />
                <span>Verify Another Document</span>
              </button>

              {/* Rest of your verification results display... keeping your existing structure */}
              {/* Status Header */}
              <div
                className={`border-2 rounded-2xl p-6 sm:p-8 mb-8 ${
                  verificationData.valid
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-lg shadow-green-500/20"
                    : "bg-gradient-to-r from-red-50 to-rose-50 border-red-400 shadow-lg shadow-red-500/20"
                }`}
              >
                <div className="flex items-center space-x-4">
                  {verificationData.valid ? (
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle size={32} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                      <AlertCircle size={32} className="text-white" />
                    </div>
                  )}
                  <div>
                    <h2
                      className={`text-3xl font-bold ${
                        verificationData.valid
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {verificationData.valid
                        ? "✓ Document Verified"
                        : "✗ Verification Failed"}
                    </h2>
                    <p
                      className={`text-lg ${
                        verificationData.valid
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {verificationData.valid
                        ? "This document is authentic and verified on the blockchain"
                        : "This document could not be verified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Details Card */}
              {verificationData.valid && (
                <div className="space-y-6">
                  {/* Main Certificate Card */}
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#3834A8] via-[#2A1B5D] to-[#3834A8] p-6 text-white">
                      <div className="flex items-center justify-center space-x-3">
                        <CheckCircle size={28} />
                        <h2 className="text-2xl font-bold">
                          Verified Document
                        </h2>
                      </div>
                    </div>

                    {/* University/Organization Info */}
                    <div className="p-8 border-b border-gray-200">
                      <div className="flex flex-col items-center text-center space-y-4">
                        {verificationData.university?.logo ? (
                          <img
                            src={verificationData.university.logo}
                            alt={
                              verificationData.university.name || "Organization"
                            }
                            className="w-24 h-24 object-contain"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-[#3834A8] to-[#2A1B5D] rounded-full flex items-center justify-center shadow-lg">
                            <GraduationCap size={48} className="text-white" />
                          </div>
                        )}
                        <div>
                          <h1 className="text-3xl font-bold text-[#2A1B5D]">
                            {verificationData.university?.name ||
                              verificationData.document?.issuer ||
                              verificationData.batch?.issuer ||
                              "Verified Organization"}
                          </h1>
                          <p className="text-sm text-gray-500 mt-2">
                            Verified on the blockchain
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Document Details Grid */}
                    <div className="p-8 bg-gradient-to-br from-gray-50 to-slate-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Holder Name */}
                        {(verificationData.holder?.name ||
                          verificationData.document?.studentName) && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                              Holder Name
                            </p>
                            <p className="text-lg font-bold text-[#2A1B5D]">
                              {verificationData.holder?.name ||
                                verificationData.document?.studentName}
                            </p>
                          </div>
                        )}

                        {/* Holder Email */}
                        {verificationData.holder?.email && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                              Holder Email
                            </p>
                            <p className="text-base font-medium text-[#2A1B5D]">
                              {verificationData.holder.email}
                            </p>
                          </div>
                        )}

                        {/* Student/Holder Number */}
                        {(verificationData.holder?.studentNumber ||
                          verificationData.document?.studentNumber ||
                          verificationData.document?.holderNumber) && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                              Student Number
                            </p>
                            <p className="text-lg font-bold text-[#2A1B5D]">
                              {verificationData.holder?.studentNumber ||
                                verificationData.document?.studentNumber ||
                                verificationData.document?.holderNumber}
                            </p>
                          </div>
                        )}

                        {/* Position in Batch */}
                        {verificationData.holder?.position && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                              Position in Batch
                            </p>
                            <p className="text-base font-medium text-[#2A1B5D]">
                              Document {verificationData.holder.position.number}{" "}
                              of {verificationData.holder.position.total}
                            </p>
                          </div>
                        )}

                        {/* Document Title */}
                        {(verificationData.document?.degree ||
                          verificationData.document?.title) && (
                          <div className="bg-white rounded-xl p-4 shadow-sm sm:col-span-2 border border-gray-100">
                            <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                              Document Title
                            </p>
                            <p className="text-lg font-bold text-[#2A1B5D]">
                              {verificationData.document.degree ||
                                verificationData.document.title}
                            </p>
                          </div>
                        )}

                        {/* Document Type */}
                        {verificationData.document?.docType && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                              Document Type
                            </p>
                            <p className="text-lg font-bold text-[#2A1B5D] capitalize">
                              {verificationData.document.docType}
                            </p>
                          </div>
                        )}

                        {/* Document ID */}
                        {verificationData.docId && (
                          <div className="bg-white rounded-xl p-4 shadow-sm sm:col-span-2 lg:col-span-3 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide">
                                Document ID / Serial Number
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(verificationData.docId)
                                }
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-[#3834A8]" />
                                )}
                              </button>
                            </div>
                            <p className="text-base font-mono text-[#2A1B5D] break-all">
                              {verificationData.docId}
                            </p>
                          </div>
                        )}

                        {/* Issuer */}
                        {verificationData.document?.issuer && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                              Issuer
                            </p>
                            <p className="text-lg font-bold text-[#2A1B5D]">
                              {verificationData.document.issuer}
                            </p>
                          </div>
                        )}

                        {/* Course */}
                        {verificationData.document?.course && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                              Course
                            </p>
                            <p className="text-lg font-bold text-[#2A1B5D]">
                              {verificationData.document.course}
                            </p>
                          </div>
                        )}

                        {/* Grade */}
                        {verificationData.document?.grade && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                              Grade
                            </p>
                            <p className="text-lg font-bold text-[#2A1B5D]">
                              {verificationData.document.grade}
                            </p>
                          </div>
                        )}

                        {/* Issue Date */}
                        {(verificationData.document?.issuedAt ||
                          verificationData.batch?.createdAt) && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                              Issue Date
                            </p>
                            <p className="text-lg font-bold text-[#2A1B5D]">
                              {new Date(
                                verificationData.document?.issuedAt ||
                                  verificationData.batch?.createdAt,
                              ).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        )}

                        {/* Verified At */}
                        {verificationData.verifiedAt && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                              Verified At
                            </p>
                            <p className="text-base font-medium text-[#2A1B5D]">
                              {new Date(
                                verificationData.verifiedAt,
                              ).toLocaleString("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Holder Identity Section */}
                    {verificationData.document?.identity && (
                      <div className="p-8 bg-white border-t border-gray-200">
                        <h3 className="text-lg font-bold text-[#2A1B5D] mb-4 flex items-center space-x-2">
                          <User size={20} className="text-[#3834A8]" />
                          <span>Holder Identity Information</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {verificationData.document.identity.email && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                                Email
                              </p>
                              <p className="text-base font-medium text-[#2A1B5D]">
                                {verificationData.document.identity.email}
                              </p>
                            </div>
                          )}
                          {verificationData.document.identity.birthday && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                                Birthday
                              </p>
                              <p className="text-base font-medium text-[#2A1B5D]">
                                {verificationData.document.identity.birthday}
                              </p>
                            </div>
                          )}
                          {verificationData.document.identity.gender && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide mb-2">
                                Gender
                              </p>
                              <p className="text-base font-medium text-[#2A1B5D]">
                                {verificationData.document.identity.gender}
                              </p>
                            </div>
                          )}
                          {verificationData.document.identity
                            .identityString && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sm:col-span-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-[#3834A8] uppercase tracking-wide">
                                  Identity String (used for hashing)
                                </p>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      verificationData.document.identity
                                        .identityString,
                                    )
                                  }
                                  className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                >
                                  {copied ? (
                                    <Check
                                      size={14}
                                      className="text-green-600"
                                    />
                                  ) : (
                                    <Copy
                                      size={14}
                                      className="text-[#3834A8]"
                                    />
                                  )}
                                </button>
                              </div>
                              <p className="text-sm font-mono text-[#2A1B5D] break-all">
                                {
                                  verificationData.document.identity
                                    .identityString
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Document Access Links */}
                    {verificationData.access && (
                      <div className="p-8 bg-white border-t border-gray-200">
                        <h3 className="text-lg font-bold text-[#2A1B5D] mb-4 flex items-center space-x-2">
                          <FileText size={20} className="text-[#3834A8]" />
                          <span>Document Access & Links</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Original Document - Accordion with Preview */}
                          {verificationData.access.canonicalDocument &&
                            !verificationData.access.canonicalDocument.includes(
                              "/null",
                            ) && (
                              <div className="sm:col-span-2 bg-gradient-to-r from-[#3834A8]/5 to-[#2A1B5D]/5 border border-[#3834A8]/20 rounded-xl overflow-hidden">
                                {/* Accordion Header */}
                                <div
                                  onClick={() =>
                                    setShowDocumentPreview(!showDocumentPreview)
                                  }
                                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#3834A8]/10 transition-all"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#3834A8] to-[#2A1B5D] rounded-lg flex items-center justify-center">
                                      <FileText
                                        size={20}
                                        className="text-white"
                                      />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[#2A1B5D]">
                                        Original Document (IPFS)
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {showDocumentPreview
                                          ? "Click to hide preview"
                                          : "Click to view document"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <a
                                      href={
                                        verificationData.access
                                          .canonicalDocument
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-2 hover:bg-[#3834A8]/20 rounded-lg transition-colors"
                                      title="Open in new tab"
                                    >
                                      <ExternalLink
                                        size={18}
                                        className="text-[#3834A8]"
                                      />
                                    </a>
                                    <a
                                      href={
                                        verificationData.access
                                          .canonicalDocument
                                      }
                                      download
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-2 hover:bg-[#3834A8]/20 rounded-lg transition-colors"
                                      title="Download document"
                                    >
                                      <Download
                                        size={18}
                                        className="text-[#3834A8]"
                                      />
                                    </a>
                                    <div className="p-2">
                                      {showDocumentPreview ? (
                                        <ChevronUp
                                          size={20}
                                          className="text-[#3834A8]"
                                        />
                                      ) : (
                                        <ChevronDown
                                          size={20}
                                          className="text-[#3834A8]"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Document Preview */}
                                {showDocumentPreview && (
                                  <div className="border-t border-[#3834A8]/20">
                                    {/* PDF Viewer */}
                                    <div className="bg-gray-100 p-4">
                                      <div
                                        className="bg-white rounded-lg shadow-inner overflow-hidden"
                                        style={{ height: "600px" }}
                                      >
                                        <iframe
                                          src={`${verificationData.access.canonicalDocument}#toolbar=1&navpanes=0&scrollbar=1`}
                                          className="w-full h-full"
                                          title="Document Preview"
                                          style={{ border: "none" }}
                                        />
                                      </div>
                                      <div className="mt-4 flex items-center justify-between">
                                        <p className="text-xs text-gray-500 font-mono truncate flex-1 mr-4">
                                          {
                                            verificationData.access
                                              .canonicalDocument
                                          }
                                        </p>
                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={() =>
                                              copyToClipboard(
                                                verificationData.access
                                                  .canonicalDocument,
                                              )
                                            }
                                            className="flex items-center space-x-1 px-3 py-1.5 bg-[#3834A8]/10 hover:bg-[#3834A8]/20 rounded-lg text-sm font-medium text-[#3834A8] transition-colors"
                                          >
                                            {copied ? (
                                              <Check size={14} />
                                            ) : (
                                              <Copy size={14} />
                                            )}
                                            <span>
                                              {copied ? "Copied!" : "Copy URL"}
                                            </span>
                                          </button>
                                          <a
                                            href={
                                              verificationData.access
                                                .canonicalDocument
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-1 px-3 py-1.5 bg-[#3834A8] hover:bg-[#2A1B5D] rounded-lg text-sm font-medium text-white transition-colors"
                                          >
                                            <ExternalLink size={14} />
                                            <span>Open in IPFS</span>
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                          {/* Display Document (with QR) */}
                          {verificationData.access.displayDocument &&
                            !verificationData.access.displayDocument.includes(
                              "/null",
                            ) && (
                              <a
                                href={verificationData.access.displayDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-xl p-4 transition-all group"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                    <FileText
                                      size={20}
                                      className="text-white"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-green-700 group-hover:text-green-600">
                                      Display Document
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Version with QR Code
                                    </p>
                                  </div>
                                </div>
                                <ExternalLink
                                  size={18}
                                  className="text-gray-400 group-hover:text-green-600"
                                />
                              </a>
                            )}

                          {/* Blockchain Explorer (Batch Transaction) */}
                          {verificationData.access.blockchainExplorer && (
                            <div className="sm:col-span-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl overflow-hidden">
                              {/* Accordion Header */}
                              <div
                                onClick={() =>
                                  setShowBatchTransaction(!showBatchTransaction)
                                }
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-amber-100 transition-all"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                                    <Hash size={20} className="text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-amber-700">
                                      Batch Transaction (Solana)
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {showBatchTransaction
                                        ? "Click to hide explorer"
                                        : "Click to view on Solana Explorer"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <a
                                    href={
                                      verificationData.access.blockchainExplorer
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 hover:bg-amber-200 rounded-lg transition-colors"
                                    title="Open in new tab"
                                  >
                                    <ExternalLink
                                      size={18}
                                      className="text-amber-600"
                                    />
                                  </a>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(
                                        verificationData.access
                                          .blockchainExplorer,
                                      );
                                    }}
                                    className="p-2 hover:bg-amber-200 rounded-lg transition-colors"
                                    title="Copy URL"
                                  >
                                    {copied ? (
                                      <Check
                                        size={18}
                                        className="text-green-600"
                                      />
                                    ) : (
                                      <Copy
                                        size={18}
                                        className="text-amber-600"
                                      />
                                    )}
                                  </button>
                                  <div className="p-2">
                                    {showBatchTransaction ? (
                                      <ChevronUp
                                        size={20}
                                        className="text-amber-600"
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={20}
                                        className="text-amber-600"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Explorer Preview */}
                              {showBatchTransaction && (
                                <div className="border-t border-amber-200">
                                  <div className="bg-gray-100 p-4">
                                    <div
                                      className="bg-white rounded-lg shadow-inner overflow-hidden"
                                      style={{ height: "500px" }}
                                    >
                                      <iframe
                                        src={
                                          verificationData.access
                                            .blockchainExplorer
                                        }
                                        className="w-full h-full"
                                        title="Solana Explorer - Batch Transaction"
                                        style={{ border: "none" }}
                                      />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                      <p className="text-xs text-gray-500 font-mono truncate flex-1 mr-4">
                                        {
                                          verificationData.access
                                            .blockchainExplorer
                                        }
                                      </p>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() =>
                                            copyToClipboard(
                                              verificationData.access
                                                .blockchainExplorer,
                                            )
                                          }
                                          className="flex items-center space-x-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded-lg text-sm font-medium text-amber-700 transition-colors"
                                        >
                                          {copied ? (
                                            <Check size={14} />
                                          ) : (
                                            <Copy size={14} />
                                          )}
                                          <span>
                                            {copied ? "Copied!" : "Copy URL"}
                                          </span>
                                        </button>
                                        <a
                                          href={
                                            verificationData.access
                                              .blockchainExplorer
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-sm font-medium text-white transition-colors"
                                        >
                                          <ExternalLink size={14} />
                                          <span>Open in Solana Explorer</span>
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Holder Explorer URL (Individual Transaction) */}
                          {verificationData.access.holderExplorerUrl && (
                            <div className="sm:col-span-2 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl overflow-hidden">
                              {/* Accordion Header */}
                              <div
                                onClick={() =>
                                  setShowHolderTransaction(
                                    !showHolderTransaction,
                                  )
                                }
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-teal-100 transition-all"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                    <User size={20} className="text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-teal-700">
                                      Holder Transaction (Solana)
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {showHolderTransaction
                                        ? "Click to hide explorer"
                                        : "Click to view individual holder record"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <a
                                    href={
                                      verificationData.access.holderExplorerUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 hover:bg-teal-200 rounded-lg transition-colors"
                                    title="Open in new tab"
                                  >
                                    <ExternalLink
                                      size={18}
                                      className="text-teal-600"
                                    />
                                  </a>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(
                                        verificationData.access
                                          .holderExplorerUrl,
                                      );
                                    }}
                                    className="p-2 hover:bg-teal-200 rounded-lg transition-colors"
                                    title="Copy URL"
                                  >
                                    {copied ? (
                                      <Check
                                        size={18}
                                        className="text-green-600"
                                      />
                                    ) : (
                                      <Copy
                                        size={18}
                                        className="text-teal-600"
                                      />
                                    )}
                                  </button>
                                  <div className="p-2">
                                    {showHolderTransaction ? (
                                      <ChevronUp
                                        size={20}
                                        className="text-teal-600"
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={20}
                                        className="text-teal-600"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Explorer Preview */}
                              {showHolderTransaction && (
                                <div className="border-t border-teal-200">
                                  <div className="bg-gray-100 p-4">
                                    <div
                                      className="bg-white rounded-lg shadow-inner overflow-hidden"
                                      style={{ height: "500px" }}
                                    >
                                      <iframe
                                        src={
                                          verificationData.access
                                            .holderExplorerUrl
                                        }
                                        className="w-full h-full"
                                        title="Solana Explorer - Holder Transaction"
                                        style={{ border: "none" }}
                                      />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                      <p className="text-xs text-gray-500 font-mono truncate flex-1 mr-4">
                                        {
                                          verificationData.access
                                            .holderExplorerUrl
                                        }
                                      </p>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() =>
                                            copyToClipboard(
                                              verificationData.access
                                                .holderExplorerUrl,
                                            )
                                          }
                                          className="flex items-center space-x-1 px-3 py-1.5 bg-teal-100 hover:bg-teal-200 rounded-lg text-sm font-medium text-teal-700 transition-colors"
                                        >
                                          {copied ? (
                                            <Check size={14} />
                                          ) : (
                                            <Copy size={14} />
                                          )}
                                          <span>
                                            {copied ? "Copied!" : "Copy URL"}
                                          </span>
                                        </button>
                                        <a
                                          href={
                                            verificationData.access
                                              .holderExplorerUrl
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center space-x-1 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 rounded-lg text-sm font-medium text-white transition-colors"
                                        >
                                          <ExternalLink size={14} />
                                          <span>Open in Solana Explorer</span>
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Holder Verify URL */}
                          {verificationData.access.holderVerifyUrl && (
                            <div className="sm:col-span-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4 transition-all">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                                    <Shield size={20} className="text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-cyan-700">
                                      Holder Verification URL
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Share this link to verify this document
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      verificationData.access.holderVerifyUrl,
                                    )
                                  }
                                  className="p-2 hover:bg-cyan-100 rounded-lg transition-colors"
                                >
                                  {copied ? (
                                    <Check
                                      size={18}
                                      className="text-green-600"
                                    />
                                  ) : (
                                    <Copy size={18} className="text-cyan-600" />
                                  )}
                                </button>
                              </div>
                              <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-sm font-mono text-[#2A1B5D] break-all">
                                  {verificationData.access.holderVerifyUrl}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* API Verify URL */}
                          {verificationData.access.apiVerifyUrl && (
                            <div className="sm:col-span-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 transition-all">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                    <Zap size={20} className="text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-purple-700">
                                      API Verification Endpoint
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      For programmatic verification
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      verificationData.access.apiVerifyUrl,
                                    )
                                  }
                                  className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                >
                                  {copied ? (
                                    <Check
                                      size={18}
                                      className="text-green-600"
                                    />
                                  ) : (
                                    <Copy
                                      size={18}
                                      className="text-purple-600"
                                    />
                                  )}
                                </button>
                              </div>
                              <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-sm font-mono text-[#2A1B5D] break-all">
                                  {verificationData.access.apiVerifyUrl}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Verification Steps */}
                  {verificationData.verification?.steps &&
                    verificationData.verification.steps.length > 0 && (
                      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                        <h3 className="text-xl font-bold text-[#2A1B5D] mb-6 flex items-center space-x-2">
                          <Shield size={24} className="text-[#3834A8]" />
                          <span>Verification Steps</span>
                        </h3>
                        <div className="space-y-4">
                          {verificationData.verification.steps.map(
                            (step, index) => (
                              <div
                                key={index}
                                className={`rounded-xl p-5 border-2 ${
                                  step.status === "valid"
                                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                                    : "bg-gradient-to-r from-red-50 to-rose-50 border-red-300"
                                }`}
                              >
                                <div className="flex items-start space-x-4">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      step.status === "valid"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
                                  >
                                    {step.status === "valid" ? (
                                      <CheckCircle
                                        size={20}
                                        className="text-white"
                                      />
                                    ) : (
                                      <AlertCircle
                                        size={20}
                                        className="text-white"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                        STEP {step.step}
                                      </span>
                                      <h4
                                        className={`font-bold ${
                                          step.status === "valid"
                                            ? "text-green-700"
                                            : "text-red-700"
                                        }`}
                                      >
                                        {step.name}
                                      </h4>
                                    </div>
                                    <p
                                      className={`text-sm mb-3 ${
                                        step.status === "valid"
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {step.details?.message}
                                    </p>
                                    {step.details && (
                                      <div className="bg-white/60 rounded-lg p-3 space-y-2 text-sm">
                                        {step.details.identityString && (
                                          <div>
                                            <span className="font-semibold text-[#3834A8]">
                                              Identity String:{" "}
                                            </span>
                                            <span className="font-mono text-[#2A1B5D] text-xs break-all">
                                              {step.details.identityString}
                                            </span>
                                          </div>
                                        )}
                                        {step.details.ipfsCid && (
                                          <div>
                                            <span className="font-semibold text-[#3834A8]">
                                              IPFS CID:{" "}
                                            </span>
                                            <span className="font-mono text-[#2A1B5D] text-xs break-all">
                                              {step.details.ipfsCid}
                                            </span>
                                          </div>
                                        )}
                                        {step.details.expected && (
                                          <div>
                                            <span className="font-semibold text-[#3834A8]">
                                              Expected Hash:{" "}
                                            </span>
                                            <span className="font-mono text-[#2A1B5D] text-xs break-all">
                                              {step.details.expected}
                                            </span>
                                          </div>
                                        )}
                                        {step.details.computed && (
                                          <div>
                                            <span className="font-semibold text-[#3834A8]">
                                              Computed Hash:{" "}
                                            </span>
                                            <span className="font-mono text-[#2A1B5D] text-xs break-all">
                                              {step.details.computed}
                                            </span>
                                          </div>
                                        )}
                                        {step.details.merkleRoot && (
                                          <div>
                                            <span className="font-semibold text-[#3834A8]">
                                              Merkle Root:{" "}
                                            </span>
                                            <span className="font-mono text-[#2A1B5D] text-xs break-all">
                                              {step.details.merkleRoot}
                                            </span>
                                          </div>
                                        )}
                                        {step.details.leafIndex !==
                                          undefined && (
                                          <div>
                                            <span className="font-semibold text-[#3834A8]">
                                              Leaf Index:{" "}
                                            </span>
                                            <span className="font-medium text-[#2A1B5D]">
                                              {step.details.leafIndex}
                                            </span>
                                          </div>
                                        )}
                                        {step.details.txSig && (
                                          <div>
                                            <span className="font-semibold text-[#3834A8]">
                                              Transaction Signature:{" "}
                                            </span>
                                            <span className="font-mono text-[#2A1B5D] text-xs break-all">
                                              {step.details.txSig}
                                            </span>
                                          </div>
                                        )}
                                        {step.details.network && (
                                          <div>
                                            <span className="font-semibold text-[#3834A8]">
                                              Network:{" "}
                                            </span>
                                            <span className="font-medium text-[#2A1B5D]">
                                              {step.details.network}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Verification Summary */}
                        {verificationData.verification.summary && (
                          <div className="mt-6 bg-gradient-to-r from-[#3834A8]/5 to-[#2A1B5D]/5 rounded-xl p-5 border border-[#3834A8]/20">
                            <h4 className="font-bold text-[#2A1B5D] mb-3">
                              Verification Summary
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="text-center p-3 bg-white rounded-lg">
                                <div
                                  className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                                    verificationData.verification.summary
                                      .identityHashValid
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                >
                                  {verificationData.verification.summary
                                    .identityHashValid ? (
                                    <CheckCircle
                                      size={16}
                                      className="text-white"
                                    />
                                  ) : (
                                    <AlertCircle
                                      size={16}
                                      className="text-white"
                                    />
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-gray-600">
                                  Identity Hash
                                </p>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg">
                                <div
                                  className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                                    verificationData.verification.summary
                                      .merkleProofValid
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                >
                                  {verificationData.verification.summary
                                    .merkleProofValid ? (
                                    <CheckCircle
                                      size={16}
                                      className="text-white"
                                    />
                                  ) : (
                                    <AlertCircle
                                      size={16}
                                      className="text-white"
                                    />
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-gray-600">
                                  Merkle Proof
                                </p>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg">
                                <div
                                  className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                                    verificationData.verification.summary
                                      .blockchainValid
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                >
                                  {verificationData.verification.summary
                                    .blockchainValid ? (
                                    <CheckCircle
                                      size={16}
                                      className="text-white"
                                    />
                                  ) : (
                                    <AlertCircle
                                      size={16}
                                      className="text-white"
                                    />
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-gray-600">
                                  Blockchain
                                </p>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg">
                                <div
                                  className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                                    verificationData.verification.summary
                                      .overallValid
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                >
                                  {verificationData.verification.summary
                                    .overallValid ? (
                                    <CheckCircle
                                      size={16}
                                      className="text-white"
                                    />
                                  ) : (
                                    <AlertCircle
                                      size={16}
                                      className="text-white"
                                    />
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-gray-600">
                                  Overall
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Batch Information */}
                  {verificationData.batch && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                      <h3 className="text-xl font-bold text-[#2A1B5D] mb-4 flex items-center space-x-2">
                        <FileText size={24} className="text-[#3834A8]" />
                        <span>Batch Information</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {verificationData.batch.batchId && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sm:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-[#3834A8]">
                                Batch ID
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.batch.batchId,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-[#3834A8]" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.batch.batchId}
                            </p>
                          </div>
                        )}
                        {verificationData.batch.documentCount && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-sm font-semibold text-[#3834A8] mb-1">
                              Documents in Batch
                            </p>
                            <p className="text-2xl font-bold text-[#2A1B5D]">
                              {verificationData.batch.documentCount}
                            </p>
                          </div>
                        )}
                        {verificationData.batch.createdAt && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-sm font-semibold text-[#3834A8] mb-1">
                              Batch Created
                            </p>
                            <p className="text-base font-medium text-[#2A1B5D]">
                              {new Date(
                                verificationData.batch.createdAt,
                              ).toLocaleString("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        )}
                        {verificationData.batch.merkleRoot && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sm:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-[#3834A8]">
                                Batch Merkle Root
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.batch.merkleRoot,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-[#3834A8]" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.batch.merkleRoot}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Blockchain Information */}
                  {verificationData.verification && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                      <h3 className="text-xl font-bold text-[#2A1B5D] mb-4 flex items-center space-x-2">
                        <Hash size={24} className="text-[#3834A8]" />
                        <span>Blockchain Information</span>
                      </h3>
                      <div className="space-y-4">
                        {verificationData.verification.blockchain_network && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-sm font-semibold text-[#3834A8] mb-1">
                              Network
                            </p>
                            <p className="text-base font-medium text-[#2A1B5D]">
                              {verificationData.verification.blockchain_network}
                            </p>
                          </div>
                        )}

                        {/* Document Hash */}
                        {(verificationData.document?.hash ||
                          verificationData.verification?.document_hash) && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-[#3834A8]">
                                Document Hash
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.document?.hash ||
                                      verificationData.verification
                                        ?.document_hash,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={16} className="text-green-600" />
                                ) : (
                                  <Copy size={16} className="text-[#3834A8]" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.document?.hash ||
                                verificationData.verification?.document_hash}
                            </p>
                          </div>
                        )}

                        {/* Transaction Signature/Hash */}
                        {(verificationData.verification
                          ?.transaction_signature ||
                          verificationData.batch?.transactionSignature ||
                          verificationData.document?.transactionHash ||
                          verificationData.technical?.txSig) && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-[#3834A8]">
                                Transaction Signature
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.verification
                                      ?.transaction_signature ||
                                      verificationData.batch
                                        ?.transactionSignature ||
                                      verificationData.document
                                        ?.transactionHash ||
                                      verificationData.technical?.txSig,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={16} className="text-green-600" />
                                ) : (
                                  <Copy size={16} className="text-[#3834A8]" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.verification
                                ?.transaction_signature ||
                                verificationData.batch?.transactionSignature ||
                                verificationData.document?.transactionHash ||
                                verificationData.technical?.txSig}
                            </p>
                          </div>
                        )}

                        {/* Blockchain Explorer Link */}
                        {(verificationData.verification?.explorer_url ||
                          verificationData.batch?.explorerUrl ||
                          verificationData.access?.blockchainExplorer) && (
                          <a
                            href={
                              verificationData.verification?.explorer_url ||
                              verificationData.batch?.explorerUrl ||
                              verificationData.access?.blockchainExplorer
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] hover:from-[#2A1B5D] hover:to-[#3834A8] text-white rounded-xl px-6 py-3 font-semibold transition-all shadow-lg"
                          >
                            <ExternalLink size={18} />
                            <span>View on Blockchain Explorer</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Merkle Hashes */}
                  {verificationData.merkleHashes && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                      <h3 className="text-xl font-bold text-[#2A1B5D] mb-4 flex items-center space-x-2">
                        <Hash size={24} className="text-green-600" />
                        <span>Merkle Proofs</span>
                      </h3>
                      <div className="space-y-4">
                        {verificationData.merkleHashes.personal && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-green-600">
                                Personal Hash
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.merkleHashes.personal,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={16} className="text-green-600" />
                                ) : (
                                  <Copy size={16} className="text-green-600" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.merkleHashes.personal}
                            </p>
                          </div>
                        )}

                        {verificationData.merkleHashes.root && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-green-600">
                                Root Hash
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.merkleHashes.root,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={16} className="text-green-600" />
                                ) : (
                                  <Copy size={16} className="text-green-600" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.merkleHashes.root}
                            </p>
                          </div>
                        )}

                        {verificationData.merkleHashes.computedMerkleHash && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-green-600">
                                Computed Merkle Hash
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.merkleHashes
                                      .computedMerkleHash,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={16} className="text-green-600" />
                                ) : (
                                  <Copy size={16} className="text-green-600" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.merkleHashes.computedMerkleHash}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Technical Details */}
                  {verificationData.technical && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                      <h3 className="text-xl font-bold text-[#2A1B5D] mb-4 flex items-center space-x-2">
                        <Lock size={24} className="text-amber-600" />
                        <span>Technical Details</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {verificationData.technical.identityString && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sm:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-amber-600">
                                Identity String
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.technical.identityString,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-amber-600" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.technical.identityString}
                            </p>
                          </div>
                        )}

                        {verificationData.technical.merkleHash && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sm:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-amber-600">
                                Merkle Hash
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.technical.merkleHash,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-amber-600" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.technical.merkleHash}
                            </p>
                          </div>
                        )}

                        {verificationData.technical.merkleRoot && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sm:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-amber-600">
                                Merkle Root
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.technical.merkleRoot,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-amber-600" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.technical.merkleRoot}
                            </p>
                          </div>
                        )}

                        {verificationData.technical.leafIndex !== undefined && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-sm font-semibold text-amber-600 mb-1">
                              Leaf Index
                            </p>
                            <p className="text-2xl font-bold text-[#2A1B5D]">
                              {verificationData.technical.leafIndex}
                            </p>
                          </div>
                        )}

                        {verificationData.technical.canonicalCid && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-amber-600">
                                Canonical CID (IPFS)
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.technical.canonicalCid,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-amber-600" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.technical.canonicalCid}
                            </p>
                          </div>
                        )}

                        {verificationData.technical.displayCid && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-amber-600">
                                Display CID (IPFS)
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.technical.displayCid,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-amber-600" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.technical.displayCid}
                            </p>
                          </div>
                        )}

                        {verificationData.technical.txSig && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sm:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-amber-600">
                                Transaction Signature
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.technical.txSig,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-amber-600" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.technical.txSig}
                            </p>
                          </div>
                        )}

                        {verificationData.technical.verificationEndpoint && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sm:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-amber-600">
                                Verification API Endpoint
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    verificationData.technical
                                      .verificationEndpoint,
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              >
                                {copied ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy size={14} className="text-amber-600" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-mono text-[#2A1B5D] break-all">
                              {verificationData.technical.verificationEndpoint}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-8">
        <div className="inline-flex items-center justify-center space-x-3 bg-gray-50 backdrop-blur-xl rounded-full px-6 py-3 border border-gray-200 mb-2">
          <Shield size={18} className="text-[#00E5FF]" />
          <span className="text-sm font-medium text-gray-700">Powered by</span>
          <span className="text-sm font-bold bg-gradient-to-r from-[#3834A8] to-[#00E5FF] bg-clip-text text-transparent">
            XertiQ
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Blockchain-Secured • Tamper-Proof • Instant • Free
        </p>
      </div>
    </div>
  );
};

export default Verify;
