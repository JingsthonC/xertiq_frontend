import { useState } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Search,
  QrCode,
  ExternalLink,
  FileText,
} from "lucide-react";
import apiService from "../services/api";
import Header from "../components/Header";
import ExtensionHeader from "../components/ExtensionHeader";
import NavigationHeader from "../components/NavigationHeader";
import LoadingSpinner from "../components/LoadingSpinner";

const ValidatorPage = () => {
  const [verificationMethod, setVerificationMethod] = useState("hash"); // 'hash' or 'qr'
  const [hash, setHash] = useState("");
  const [qrData, setQrData] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerifyByHash = async () => {
    if (!hash.trim()) {
      setError("Please enter a document hash");
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await apiService.get(`/validator/verify/${hash}`);
      setVerificationResult(response);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyByQR = async () => {
    if (!qrData.trim()) {
      setError("Please enter QR code data or scan a QR code");
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await apiService.post("/validator/verify-qr", {
        qrData,
      });
      setVerificationResult(response);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23]">
      <Header />
      <NavigationHeader title="Document Validator" showBack={true} />

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-4">
              <Shield size={40} className="text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Document Validator
            </h1>
            <p className="text-gray-400">
              Verify document authenticity using blockchain and IPFS
            </p>
          </div>

          {/* Verification Method Tabs */}
          <div className="flex space-x-2 mb-6 border-b border-white/10">
            <button
              onClick={() => {
                setVerificationMethod("hash");
                setError(null);
                setVerificationResult(null);
              }}
              className={`px-6 py-3 flex items-center space-x-2 border-b-2 transition-colors ${
                verificationMethod === "hash"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <FileText size={18} />
              <span>Hash Verification</span>
            </button>
            <button
              onClick={() => {
                setVerificationMethod("qr");
                setError(null);
                setVerificationResult(null);
              }}
              className={`px-6 py-3 flex items-center space-x-2 border-b-2 transition-colors ${
                verificationMethod === "qr"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <QrCode size={18} />
              <span>QR Code Verification</span>
            </button>
          </div>

          {/* Verification Form */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 mb-6">
            {verificationMethod === "hash" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Document Hash
                  </label>
                  <input
                    type="text"
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    placeholder="Enter document hash (SHA-256)"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <button
                  onClick={handleVerifyByHash}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      <span>Verify Document</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    QR Code Data or Document ID
                  </label>
                  <textarea
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    placeholder="Paste QR code data or document ID here..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <button
                  onClick={handleVerifyByQR}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <QrCode size={20} />
                      <span>Verify from QR Code</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 mb-6">
              <div className="flex items-center space-x-3">
                <XCircle size={24} className="text-red-400" />
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">
                    Verification Failed
                  </h3>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && verificationResult.verified && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle size={32} className="text-green-400" />
                <div>
                  <h3 className="text-green-400 font-semibold text-xl mb-1">
                    Document Verified
                  </h3>
                  <p className="text-green-300 text-sm">
                    This document is authentic and verified on the blockchain
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Document Title</p>
                    <p className="text-white font-medium">
                      {verificationResult.data.title}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Recipient</p>
                    <p className="text-white font-medium">
                      {verificationResult.data.studentName}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Issuer</p>
                    <p className="text-white font-medium">
                      {verificationResult.data.issuer}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Issued Date</p>
                    <p className="text-white font-medium">
                      {new Date(
                        verificationResult.data.issuedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Blockchain Transaction</p>
                  <a
                    href={verificationResult.data.blockchain.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
                  >
                    <span className="font-mono text-sm">
                      {verificationResult.data.blockchain.transactionId.slice(0, 20)}...
                    </span>
                    <ExternalLink size={16} />
                  </a>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">IPFS Hash</p>
                  <p className="text-white font-mono text-sm">
                    {verificationResult.data.ipfs.canonicalCid}
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Verification URL</p>
                  <a
                    href={verificationResult.data.verification.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
                  >
                    <span className="text-sm break-all">
                      {verificationResult.data.verification.verifyUrl}
                    </span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidatorPage;







