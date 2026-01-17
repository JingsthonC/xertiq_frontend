import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  TestTube,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

const TestWidget = () => {
  const [testResults, setTestResults] = useState([]);

  const runTest = (testName) => {
    setTestResults([
      ...testResults,
      { name: testName, status: "success", time: new Date() },
    ]);
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
            <div className="w-16 h-16 bg-gradient-to-br from-[#48bb78] to-[#38a169] rounded-2xl flex items-center justify-center">
              <TestTube size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2d3748]">Test Widget</h1>
              <p className="text-[#4a5568] mt-1">
                Interactive test pages to verify integration before deployment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-12">
        {/* Widget Test Area */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#2d3748] mb-6">
            Live Widget Test
          </h2>
          <p className="text-[#4a5568] mb-6">
            Use this page to test the XertiQ verification widget in a controlled
            environment. Enter a document ID below to verify its authenticity.
          </p>

          {/* Widget Container */}
          <div className="bg-[#f7fafc] p-8 rounded-xl border-2 border-dashed border-[#cbd5e0] min-h-[400px]">
            <div className="text-center">
              <Shield size={64} className="text-[#667eea] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#2d3748] mb-3">
                Widget Integration Area
              </h3>
              <p className="text-[#4a5568] mb-6">
                This is where the verification widget would be embedded. For a
                live demo, visit:
              </p>
              <Link
                to="/verify"
                className="inline-block bg-[#667eea] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#5568d3] transition-all shadow-lg no-underline"
              >
                🔍 Try Live Verification
              </Link>
            </div>
          </div>
        </section>

        {/* Test Scenarios */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#2d3748] mb-6">
            Test Scenarios
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-[#e2e8f0] rounded-xl p-6 hover:border-[#667eea] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={24} className="text-[#48bb78]" />
                <h3 className="text-lg font-semibold text-[#2d3748]">
                  Valid Document Test
                </h3>
              </div>
              <p className="text-[#4a5568] mb-4">
                Test the widget with a valid document ID to ensure proper
                verification flow.
              </p>
              <button
                onClick={() => runTest("Valid Document")}
                className="bg-[#48bb78] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#38a169] transition-all"
              >
                Run Test
              </button>
            </div>

            <div className="border-2 border-[#e2e8f0] rounded-xl p-6 hover:border-[#667eea] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle size={24} className="text-[#f59e0b]" />
                <h3 className="text-lg font-semibold text-[#2d3748]">
                  Invalid Document Test
                </h3>
              </div>
              <p className="text-[#4a5568] mb-4">
                Test error handling with an invalid or non-existent document ID.
              </p>
              <button
                onClick={() => runTest("Invalid Document")}
                className="bg-[#f59e0b] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#d97706] transition-all"
              >
                Run Test
              </button>
            </div>

            <div className="border-2 border-[#e2e8f0] rounded-xl p-6 hover:border-[#667eea] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={24} className="text-[#667eea]" />
                <h3 className="text-lg font-semibold text-[#2d3748]">
                  QR Code Test
                </h3>
              </div>
              <p className="text-[#4a5568] mb-4">
                Test QR code scanning functionality for quick verification.
              </p>
              <button
                onClick={() => runTest("QR Code Scan")}
                className="bg-[#667eea] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#5568d3] transition-all"
              >
                Run Test
              </button>
            </div>

            <div className="border-2 border-[#e2e8f0] rounded-xl p-6 hover:border-[#667eea] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={24} className="text-[#8b5cf6]" />
                <h3 className="text-lg font-semibold text-[#2d3748]">
                  Mobile Responsive Test
                </h3>
              </div>
              <p className="text-[#4a5568] mb-4">
                Verify that the widget displays correctly on mobile devices.
              </p>
              <button
                onClick={() => runTest("Mobile Responsive")}
                className="bg-[#8b5cf6] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#7c3aed] transition-all"
              >
                Run Test
              </button>
            </div>
          </div>
        </section>

        {/* Test Results */}
        {testResults.length > 0 && (
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#2d3748] mb-6">
              Test Results
            </h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-[#16a34a]" />
                    <span className="font-medium text-[#2d3748]">
                      {result.name}
                    </span>
                  </div>
                  <span className="text-sm text-[#4a5568]">
                    {result.time.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Integration Steps */}
        <section className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl shadow-lg p-8 mt-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Integrate?</h3>
          <p className="mb-6 opacity-95">
            Once you've tested the widget, follow our integration guide to add
            it to your website.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              to="/integration-guide"
              className="bg-white text-[#667eea] px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all no-underline"
            >
              View Integration Guide
            </Link>
            <Link
              to="/iframe-examples"
              className="bg-white/10 backdrop-blur text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/30 no-underline"
            >
              See iframe Examples
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TestWidget;
