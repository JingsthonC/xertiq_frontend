import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Code, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

const IntegrationGuide = () => {
  const [activeTab, setActiveTab] = useState("javascript");
  const [copiedCode, setCopiedCode] = useState("");

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const codeExamples = {
    javascript: {
      title: "JavaScript Widget (Recommended)",
      description: "HubSpot-style embedding - No iframes, pure JavaScript",
      code: `<!-- Step 1: Add container div -->
<div id="xertiq-verify-widget"></div>

<!-- Step 2: Add widget script -->
<script src="https://xertiq-frontend.vercel.app/embed-widget.js"></script>

<!-- That's it! Widget auto-initializes -->`,
    },
    iframe: {
      title: "iframe Embed",
      description: "Traditional iframe embedding - Works everywhere",
      code: `<iframe 
  src="https://xertiq-frontend.vercel.app/embed/verify" 
  width="100%" 
  height="700" 
  frameborder="0" 
  style="border: 1px solid #e0e0e0; border-radius: 12px;">
</iframe>`,
    },
    link: {
      title: "Direct Link",
      description: "Simple hyperlink to verification page",
      code: `<!-- Basic link -->
<a href="https://xertiq-frontend.vercel.app/verify">
  Verify Document
</a>

<!-- With pre-filled document ID -->
<a href="https://xertiq-frontend.vercel.app/verify?doc=YOUR_DOC_ID">
  Verify This Certificate
</a>

<!-- As a button -->
<button onclick="window.open('https://xertiq-frontend.vercel.app/verify?doc=YOUR_DOC_ID')">
  🔍 Verify Document
</button>`,
    },
  };

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#667eea] hover:text-[#5568d3] font-medium mb-4 no-underline"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl flex items-center justify-center">
              <Shield size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2d3748]">
                Integration Guide
              </h1>
              <p className="text-[#4a5568] mt-1">
                Complete developer documentation with examples for all platforms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-12">
        {/* Getting Started */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Code size={28} className="text-[#667eea]" />
            <h2 className="text-2xl font-bold text-[#2d3748]">
              Getting Started
            </h2>
          </div>
          <p className="text-[#4a5568] leading-relaxed mb-4">
            XertiQ offers three simple ways to integrate blockchain document
            verification into your website. Choose the method that best fits
            your needs:
          </p>
          <ul className="space-y-2 text-[#4a5568]">
            <li className="flex items-start gap-2">
              <CheckCircle
                size={20}
                className="text-[#48bb78] mt-0.5 flex-shrink-0"
              />
              <span>
                <strong>JavaScript Widget:</strong> Best for modern websites,
                offers the most flexibility
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle
                size={20}
                className="text-[#48bb78] mt-0.5 flex-shrink-0"
              />
              <span>
                <strong>iframe Embed:</strong> Universal compatibility, works
                with any platform
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle
                size={20}
                className="text-[#48bb78] mt-0.5 flex-shrink-0"
              />
              <span>
                <strong>Direct Link:</strong> Simplest option, just link to the
                verification page
              </span>
            </li>
          </ul>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {Object.keys(codeExamples).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab
                  ? "bg-[#667eea] text-white shadow-lg"
                  : "bg-white text-[#4a5568] hover:bg-gray-100"
              }`}
            >
              {codeExamples[tab].title.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Code Examples */}
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-[#2d3748] mb-2">
            {codeExamples[activeTab].title}
          </h3>
          <p className="text-[#4a5568] mb-6">
            {codeExamples[activeTab].description}
          </p>

          {/* Code Block */}
          <div className="relative">
            <button
              onClick={() =>
                copyToClipboard(codeExamples[activeTab].code, activeTab)
              }
              className="absolute top-4 right-4 bg-[#667eea] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#5568d3] transition-all z-10"
            >
              {copiedCode === activeTab ? (
                <>
                  <CheckCircle size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Code
                </>
              )}
            </button>
            <pre className="bg-[#1a202c] text-[#e2e8f0] p-6 rounded-xl overflow-x-auto font-mono text-sm leading-relaxed">
              {codeExamples[activeTab].code}
            </pre>
          </div>

          {/* Live Preview */}
          {activeTab === "javascript" && (
            <div className="mt-8 bg-[#f7fafc] p-6 rounded-xl border-2 border-dashed border-[#cbd5e0]">
              <h4 className="text-lg font-semibold text-[#2d3748] mb-4">
                Live Preview:
              </h4>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-[#4a5568] text-center">
                  Widget preview would appear here. Visit{" "}
                  <Link to="/verify" className="text-[#667eea] hover:underline">
                    /verify
                  </Link>{" "}
                  to see it in action.
                </p>
              </div>
            </div>
          )}

          {activeTab === "link" && (
            <div className="mt-8 bg-[#f7fafc] p-6 rounded-xl border-2 border-dashed border-[#cbd5e0]">
              <h4 className="text-lg font-semibold text-[#2d3748] mb-4">
                Live Examples:
              </h4>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  to="/verify"
                  className="bg-[#667eea] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#5568d3] transition-all no-underline"
                >
                  Verify Document
                </Link>
                <Link
                  to="/verify?doc=test_certificate"
                  className="bg-white text-[#667eea] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all border-2 border-[#667eea] no-underline"
                >
                  Verify Test Certificate
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Additional Resources */}
        <section className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl shadow-lg p-8 mt-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
          <p className="mb-6 opacity-95">
            Check out our other resources or get in touch with our support team.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              to="/test-widget"
              className="bg-white text-[#667eea] px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all no-underline"
            >
              Test Widget
            </Link>
            <Link
              to="/iframe-examples"
              className="bg-white/10 backdrop-blur text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/30 no-underline"
            >
              iframe Examples
            </Link>
            <Link
              to="/verify"
              className="bg-white/10 backdrop-blur text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/30 no-underline"
            >
              Try Verification
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IntegrationGuide;
