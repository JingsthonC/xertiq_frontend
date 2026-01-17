import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Frame, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

const IframeExamples = () => {
  const [copiedCode, setCopiedCode] = useState("");

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const examples = [
    {
      id: "basic",
      title: "Basic iframe Embed",
      description: "Simple iframe integration with default settings",
      code: `<iframe 
  src="https://xertiq-frontend.vercel.app/embed/verify" 
  width="100%" 
  height="700" 
  frameborder="0">
</iframe>`,
    },
    {
      id: "styled",
      title: "Styled iframe",
      description: "iframe with custom styling and border",
      code: `<iframe 
  src="https://xertiq-frontend.vercel.app/embed/verify" 
  width="100%" 
  height="700" 
  frameborder="0" 
  style="border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
</iframe>`,
    },
    {
      id: "responsive",
      title: "Responsive iframe",
      description: "Responsive iframe that adapts to container width",
      code: `<div style="position: relative; padding-bottom: 75%; height: 0; overflow: hidden;">
  <iframe 
    src="https://xertiq-frontend.vercel.app/embed/verify" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;">
  </iframe>
</div>`,
    },
    {
      id: "prefilled",
      title: "Pre-filled Document ID",
      description: "iframe with pre-populated document ID parameter",
      code: `<iframe 
  src="https://xertiq-frontend.vercel.app/embed/verify?doc=YOUR_DOCUMENT_ID" 
  width="100%" 
  height="700" 
  frameborder="0" 
  style="border: 1px solid #e0e0e0; border-radius: 12px;">
</iframe>`,
    },
  ];

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
            <div className="w-16 h-16 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-2xl flex items-center justify-center">
              <Frame size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2d3748]">
                iframe Examples
              </h1>
              <p className="text-[#4a5568] mt-1">
                Learn how to embed using traditional iframe methods
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-12">
        {/* Introduction */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={28} className="text-[#667eea]" />
            <h2 className="text-2xl font-bold text-[#2d3748]">
              iframe Integration Methods
            </h2>
          </div>
          <p className="text-[#4a5568] leading-relaxed mb-4">
            The iframe method is the most universal way to embed the XertiQ
            verification widget. It works on any platform and requires no
            JavaScript knowledge.
          </p>
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle
                size={20}
                className="text-[#16a34a] mt-0.5 flex-shrink-0"
              />
              <div>
                <h3 className="font-semibold text-[#2d3748] mb-1">
                  Universal Compatibility
                </h3>
                <p className="text-sm text-[#4a5568]">
                  Works with WordPress, Shopify, Wix, Squarespace, and any
                  website builder
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Examples */}
        <div className="space-y-8">
          {examples.map((example) => (
            <section
              key={example.id}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#2d3748]">
                    {example.title}
                  </h3>
                  <p className="text-[#4a5568] mt-1">{example.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(example.code, example.id)}
                  className="bg-[#667eea] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#5568d3] transition-all"
                >
                  {copiedCode === example.id ? (
                    <>
                      <CheckCircle size={18} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Code Block */}
              <pre className="bg-[#1a202c] text-[#e2e8f0] p-6 rounded-xl overflow-x-auto font-mono text-sm leading-relaxed mb-6">
                {example.code}
              </pre>

              {/* Live Preview */}
              <div className="bg-[#f7fafc] p-6 rounded-xl border-2 border-dashed border-[#cbd5e0]">
                <h4 className="text-sm font-semibold text-[#2d3748] mb-4">
                  Live Preview:
                </h4>
                <div className="bg-white rounded-lg overflow-hidden">
                  <iframe
                    src="https://xertiq-frontend.vercel.app/embed/verify"
                    width="100%"
                    height="500"
                    frameBorder="0"
                    style={{ border: "1px solid #e2e8f0", borderRadius: "8px" }}
                    title={example.title}
                  />
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Best Practices */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-[#2d3748] mb-6">
            Best Practices
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle
                size={20}
                className="text-[#48bb78] mt-0.5 flex-shrink-0"
              />
              <div>
                <h3 className="font-semibold text-[#2d3748] mb-1">
                  Set Appropriate Height
                </h3>
                <p className="text-[#4a5568] text-sm">
                  Use a minimum height of 600-700px to ensure the full widget is
                  visible without scrolling
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle
                size={20}
                className="text-[#48bb78] mt-0.5 flex-shrink-0"
              />
              <div>
                <h3 className="font-semibold text-[#2d3748] mb-1">
                  Make it Responsive
                </h3>
                <p className="text-[#4a5568] text-sm">
                  Use width="100%" to ensure the iframe adapts to different
                  screen sizes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle
                size={20}
                className="text-[#48bb78] mt-0.5 flex-shrink-0"
              />
              <div>
                <h3 className="font-semibold text-[#2d3748] mb-1">
                  Add Styling
                </h3>
                <p className="text-[#4a5568] text-sm">
                  Use CSS to add borders, shadows, and rounded corners to match
                  your site's design
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle
                size={20}
                className="text-[#48bb78] mt-0.5 flex-shrink-0"
              />
              <div>
                <h3 className="font-semibold text-[#2d3748] mb-1">
                  Test on Mobile
                </h3>
                <p className="text-[#4a5568] text-sm">
                  Always verify that the iframe displays correctly on mobile
                  devices
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl shadow-lg p-8 mt-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Explore Other Methods</h3>
          <p className="mb-6 opacity-95">
            While iframes work everywhere, you might want to explore our
            JavaScript widget for more flexibility and better performance.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              to="/integration-guide"
              className="bg-white text-[#667eea] px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all no-underline"
            >
              View Integration Guide
            </Link>
            <Link
              to="/test-widget"
              className="bg-white/10 backdrop-blur text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/30 no-underline"
            >
              Test Widget
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

export default IframeExamples;
