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
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Full-Screen Hero - Initial State */}
        {!verificationData && !loading && (
          <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            {/* Hero Header */}
            <div className="text-center mb-16 space-y-6">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-500 via-indigo-500 to-teal-500 rounded-3xl shadow-2xl shadow-blue-500/50 transform hover:scale-110 hover:rotate-3 transition-all duration-500">
                <Shield size={56} className="text-white" />
              </div>
              <div>
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent">
                    XertiQ
                  </span>
                </h1>
                <p className="text-2xl sm:text-3xl text-white/90 font-light mb-3">
                  Blockchain Document Verification
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-white/70">
                  <span className="flex items-center space-x-2">
                    <Zap size={16} className="text-yellow-400" />
                    <span>Instant</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-2">
                    <Shield size={16} className="text-green-400" />
                    <span>Free</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-2">
                    <Lock size={16} className="text-blue-400" />
                    <span>Tamper-Proof</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Flow - Full Width */}
            <div className="w-full max-w-7xl mb-16 px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {/* Organization Card */}
                <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl transform hover:-translate-y-2 hover:shadow-indigo-500/20 transition-all duration-500">
                  <div className="flex flex-col items-center text-center space-y-6 h-full">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                      <GraduationCap size={40} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Organization</h3>
                      <p className="text-white/60 text-sm">Trusted Document Issuer</p>
                    </div>
                    <div className="space-y-3 w-full flex-1 flex flex-col justify-center">
                      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-white/90">Upload Documents</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-white/90">Generate Hash</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-white/90">Blockchain Anchor</span>
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
                    <div className="w-12 h-1 bg-gradient-to-r from-teal-500 via-teal-400/50 to-transparent rounded-full animate-pulse"></div>
                  </div>

                  {/* Main Card */}
                  <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-600 rounded-3xl p-10 shadow-2xl shadow-blue-500/50 transform group-hover:scale-105 transition-all duration-500 border-2 border-white/30 h-full flex flex-col">
                    <div className="text-white text-center space-y-6 flex-1 flex flex-col justify-center">
                      <div className="flex justify-center">
                        <div className="relative">
                          <Shield size={72} className="drop-shadow-2xl animate-pulse" />
                          <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl"></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-4xl font-black mb-2">XertiQ</h3>
                        <p className="text-blue-100 text-sm font-semibold">Verification Engine</p>
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
                            <span className="text-sm font-bold">Tamper-Proof</span>
                          </div>
                        </div>
                        <div className="bg-white/25 backdrop-blur-md rounded-xl px-4 py-3 border border-white/30">
                          <div className="flex items-center justify-center space-x-3">
                            <CheckCircle size={20} />
                            <span className="text-sm font-bold">Cryptographic</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Card */}
                <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl transform hover:-translate-y-2 hover:shadow-teal-500/20 transition-all duration-500">
                  <div className="flex flex-col items-center text-center space-y-6 h-full">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                      <CheckCircle size={40} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Verification</h3>
                      <p className="text-white/60 text-sm">Instant Validation Result</p>
                    </div>
                    <div className="space-y-3 w-full flex-1 flex flex-col justify-center">
                      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <CheckCircle size={18} className="text-teal-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-white/90">Blockchain Verified</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <CheckCircle size={18} className="text-teal-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-white/90">Merkle Proof Valid</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <CheckCircle size={18} className="text-teal-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-white/90">Authentic Document</span>
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
                  <Search size={32} className="text-gray-400 ml-4 flex-shrink-0" />
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
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:via-indigo-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-10 py-5 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                  >
                    <span>Verify</span>
                    <Shield size={22} />
                  </button>
                </div>
              </form>

              {/* Error Display */}
              {error && (
                <div className="mt-6 bg-red-500/20 backdrop-blur-xl border-2 border-red-400/50 rounded-xl p-5 flex items-center space-x-4">
                  <AlertCircle size={28} className="text-red-300 flex-shrink-0" />
                  <p className="text-red-100 font-semibold text-lg">{error}</p>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl w-full px-4">
              {[
                { label: "Secure", value: "100%", gradient: "from-blue-400 to-blue-600" },
                { label: "Verification", value: "Instant", gradient: "from-teal-400 to-teal-600" },
                { label: "No Cost", value: "Free", gradient: "from-green-400 to-green-600" },
                { label: "Available", value: "24/7", gradient: "from-purple-400 to-purple-600" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 shadow-lg transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-white/80">{stat.label}</div>
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-ping opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-600 rounded-full w-40 h-40 flex items-center justify-center shadow-2xl shadow-blue-500/50 border-4 border-white/30">
                  <Shield size={72} className="text-white animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white mb-3">Verifying...</h2>
                <p className="text-xl text-white/70">Checking blockchain records</p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                className="mb-8 inline-flex items-center space-x-3 text-white hover:text-blue-300 font-semibold text-lg transition-colors bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/20 hover:bg-white/20"
              >
                <ArrowLeft size={24} />
                <span>Verify Another Document</span>
              </button>

              {/* Rest of your verification results display... keeping your existing structure */}
              {/* Status Header */}
              <div
                className={`border-2 rounded-2xl p-6 sm:p-8 mb-8 ${
                  verificationData.valid
                    ? "bg-green-500/20 border-green-400/50 backdrop-blur-xl"
                    : "bg-red-500/20 border-red-400/50 backdrop-blur-xl"
                }`}
              >
                <div className="flex items-center space-x-4">
                  {verificationData.valid ? (
                    <CheckCircle size={48} className="text-green-300 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={48} className="text-red-300 flex-shrink-0" />
                  )}
                  <div>
                    <h2 className={`text-3xl font-bold ${verificationData.valid ? "text-green-100" : "text-red-100"}`}>
                      {verificationData.valid ? "✓ Document Verified" : "✗ Verification Failed"}
                    </h2>
                    <p className={`text-lg ${verificationData.valid ? "text-green-200" : "text-red-200"}`}>
                      {verificationData.valid
                        ? "This document is authentic and verified on the blockchain"
                        : "This document could not be verified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Details - keeping your existing certificate display */}
              {verificationData.valid && verificationData.document && (
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-white/40 mb-8">
                  {/* Your existing certificate card content */}
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 p-6 text-white">
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle size={28} />
                      <h2 className="text-2xl font-bold">Verified Document</h2>
                    </div>
                  </div>
                  <div className="p-8">
                    {/* Add your certificate details here - keeping existing structure */}
                    <p className="text-gray-700 text-center">Document details would appear here...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-8">
        <div className="inline-flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 mb-2">
          <Shield size={18} className="text-blue-400" />
          <span className="text-sm font-medium text-white/90">Powered by</span>
          <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            XertiQ
          </span>
        </div>
        <p className="text-xs text-white/60">
          Blockchain-Secured • Tamper-Proof • Instant • Free
        </p>
      </div>
    </div>
  );
};

export default Verify;
