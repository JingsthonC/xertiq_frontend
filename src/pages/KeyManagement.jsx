import { useState } from "react";
import {
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Shield,
  AlertTriangle,
  Info,
} from "lucide-react";
import useWalletStore from "../store/wallet";
import showToast from "../utils/toast";
import Header from "../components/Header";
import ExtensionHeader from "../components/ExtensionHeader";
import NavigationHeader from "../components/NavigationHeader";

const isExtension = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.chrome !== "undefined" &&
    window.chrome.runtime &&
    window.chrome.runtime.id
  );
};

const KeyManagement = () => {
  const { user } = useWalletStore();
  const isExt = isExtension();
  const [showKey, setShowKey] = useState(false);
  const [copiedText, setCopiedText] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    showToast.success("Copied to clipboard!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const maskKey = (key) => {
    if (!key) return "";
    return `${key.substring(0, 8)}${"•".repeat(20)}${key.substring(key.length - 8)}`;
  };

  return (
    <div className="min-h-screen bg-brand-background">
      {isExt ? <ExtensionHeader /> : <Header />}
      {!isExt && <NavigationHeader />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2A1B5D] mb-2">
            Access Key Management
          </h1>
          <p className="text-gray-600">
            Securely manage your issuer access key for document verification
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle
            className="text-amber-600 mt-0.5 flex-shrink-0"
            size={20}
          />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">
              Security Notice
            </h3>
            <p className="text-sm text-amber-800">
              Your access key allows verification of all documents you've
              issued. Keep it secure and never share it publicly.
            </p>
          </div>
        </div>

        {/* Main Key Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-br from-[#3834A8] to-[#2A1B5D] p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Your Issuer Access Key</h2>
                <p className="text-white/80 text-sm">
                  Personal verification credential
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-6">
            {/* Key Display */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Access Key
                </label>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="flex items-center gap-2 text-sm text-[#3834A8] hover:text-[#2A1B5D] transition-colors"
                >
                  {showKey ? (
                    <>
                      <EyeOff size={16} />
                      <span>Hide Key</span>
                    </>
                  ) : (
                    <>
                      <Eye size={16} />
                      <span>Show Key</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <code className="text-sm font-mono text-gray-800 break-all block">
                  {showKey ? user?.id : maskKey(user?.id)}
                </code>
              </div>

              {showKey && (
                <button
                  onClick={() => copyToClipboard(user?.id, "issuer-key")}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3834A8] hover:bg-[#2A1B5D] text-white rounded-lg transition-colors"
                >
                  {copiedText === "issuer-key" ? (
                    <>
                      <CheckCircle size={18} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span>Copy Access Key</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Info Sections */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <Info
                  className="text-[#3834A8] mt-0.5 flex-shrink-0"
                  size={18}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    What is this key for?
                  </h3>
                  <p className="text-sm text-gray-600">
                    This key allows you to access and verify all documents
                    you've issued as an organization. It's automatically
                    included when you copy verification links from your
                    dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Info
                  className="text-[#3834A8] mt-0.5 flex-shrink-0"
                  size={18}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    How does it work?
                  </h3>
                  <p className="text-sm text-gray-600">
                    When you share a verification link with this key, recipients
                    can view the document details and verify its authenticity on
                    the blockchain. This key is tied to your issuer account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Info
                  className="text-[#3834A8] mt-0.5 flex-shrink-0"
                  size={18}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Document holder keys
                  </h3>
                  <p className="text-sm text-gray-600">
                    Each document holder receives their own private verification
                    key via email. These keys are unique per document and remain
                    completely private to the holder.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Best Practices */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
                <Shield size={16} />
                Security Best Practices
              </h3>
              <ul className="text-sm text-blue-800 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Never share your issuer key publicly or on social media
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Only share verification links (which include the key) with
                    intended recipients
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    This key is tied to your account and cannot be changed
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    If you suspect your account is compromised, contact support
                    immediately
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Key Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Account Type</p>
              <p className="font-semibold text-gray-900">
                {user?.role === "ISSUER" ? "Issuer Organization" : user?.role}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Key Type</p>
              <p className="font-semibold text-gray-900">Issuer Access Key</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Key Status</p>
              <p className="font-semibold text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Active
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Scope</p>
              <p className="font-semibold text-gray-900">
                All Issued Documents
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyManagement;
