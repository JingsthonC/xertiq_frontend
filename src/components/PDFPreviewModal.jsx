import { useState, useEffect } from "react";
import { X, Download, ExternalLink, AlertCircle, Loader2 } from "lucide-react";

const PDFPreviewModal = ({ isOpen, onClose, pdfUrl, title, docId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  useEffect(() => {
    if (isOpen && pdfUrl) {
      setLoading(true);
      setError(null);
      setPdfBlobUrl(null);
      loadPDF();
    }

    return () => {
      // Cleanup blob URL when component unmounts
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [isOpen, pdfUrl]);

  const getPinataGatewayUrl = (cid) => {
    if (!cid) return null;
    // If already a full URL, return as is
    if (cid.startsWith("http")) return cid;
    // Remove any leading slashes or "ipfs/" prefix
    const cleanCid = cid.replace(/^\/+/, "").replace(/^ipfs\//, "");
    // Construct Pinata gateway URL
    return `https://gateway.pinata.cloud/ipfs/${cleanCid}`;
  };

  const loadPDF = async () => {
    try {
      const displayUrl = getPinataGatewayUrl(pdfUrl);
      if (!displayUrl) {
        setError("Invalid PDF URL");
        setLoading(false);
        return;
      }

      // Try to fetch the PDF and create a blob URL
      // This helps with CORS issues and allows better error handling
      const response = await fetch(displayUrl, {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load PDF: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      if (blob.type !== "application/pdf" && !blob.type.includes("pdf")) {
        throw new Error("The file is not a valid PDF");
      }

      const blobUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(blobUrl);
      setLoading(false);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError(err.message || "Failed to load PDF");
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const displayUrl = getPinataGatewayUrl(pdfUrl);
    if (displayUrl) {
      window.open(displayUrl, "_blank");
    }
  };

  if (!isOpen || !pdfUrl) return null;

  const displayUrl = getPinataGatewayUrl(pdfUrl);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gray-800/50 rounded-t-2xl">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">
              {title || "PDF Preview"}
            </h2>
            {docId && (
              <p className="text-sm text-gray-400">Document ID: {docId}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {displayUrl && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 transition-all"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 transition-all"
                >
                  <ExternalLink size={16} />
                  <span className="hidden sm:inline">Open in New Tab</span>
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <X size={20} className="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="flex-1 overflow-hidden p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="animate-spin text-purple-400 mx-auto mb-4" size={48} />
                <p className="text-gray-400 text-lg mb-2">Loading PDF...</p>
                <p className="text-gray-500 text-sm">
                  Fetching document from IPFS
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
                <p className="text-gray-400 text-lg mb-2">Failed to load PDF</p>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                {displayUrl && (
                  <div className="space-y-2">
                    <p className="text-gray-500 text-xs break-all">
                      URL: {displayUrl}
                    </p>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 transition-all"
                    >
                      Try opening in new tab
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : pdfBlobUrl ? (
            <iframe
              src={pdfBlobUrl}
              className="w-full h-full rounded-xl border border-white/10"
              title="PDF Preview"
              style={{ minHeight: "500px" }}
              onLoad={() => setLoading(false)}
            />
          ) : displayUrl ? (
            // Fallback to direct URL if blob loading failed
            <iframe
              src={`${displayUrl}#toolbar=0`}
              className="w-full h-full rounded-xl border border-white/10"
              title="PDF Preview"
              style={{ minHeight: "500px" }}
              onError={() => {
                setError("Failed to display PDF in iframe");
                setLoading(false);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 text-lg mb-2">PDF not available</p>
                <p className="text-gray-500 text-sm">
                  The PDF document is not available for preview.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;

