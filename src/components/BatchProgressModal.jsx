import { useEffect, useState, useRef } from "react";
import { CheckCircle, XCircle, Loader, Clock } from "lucide-react";

const BatchProgressModal = ({ sessionId, onClose, onComplete }) => {
  const [progress, setProgress] = useState({
    totalDocuments: 0,
    processedDocuments: 0,
    successfulDocuments: 0,
    failedDocuments: 0,
    documents: [],
    status: "processing",
    currentStep: 0,
    currentMessage: "",
  });
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    // Create EventSource for SSE
    const token = localStorage.getItem("token");
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/batch/progress/${sessionId}?token=${token}`,
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("SSE connection opened");
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Progress update:", data);

        if (data.type === "connected") {
          setIsConnected(true);
        } else if (data.type === "progress" && data.data) {
          setProgress(data.data);
        } else if (data.type === "complete" && data.data) {
          setProgress(data.data);
          if (onComplete) {
            onComplete(data.data);
          }
        } else if (data.type === "error") {
          console.error("Progress error:", data.message);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      setIsConnected(false);
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [sessionId, onComplete]);

  const progressPercentage =
    progress.totalDocuments > 0
      ? (progress.processedDocuments / progress.totalDocuments) * 100
      : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Processing Batch Upload</h2>
          <p className="text-purple-100 mt-1">
            {isConnected ? "Connected" : "Connecting..."}
          </p>
          {progress.currentStep > 0 && (
            <p className="text-sm text-purple-200 mt-2">
              Step {progress.currentStep}/8:{" "}
              {progress.currentMessage || "Processing..."}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {progress.processedDocuments} of {progress.totalDocuments}{" "}
                documents processed
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="text-blue-500" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {progress.processedDocuments}
              </div>
              <div className="text-xs text-gray-500">Processed</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="text-green-500" size={24} />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {progress.successfulDocuments}
              </div>
              <div className="text-xs text-gray-500">Successful</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="text-red-500" size={24} />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {progress.failedDocuments}
              </div>
              <div className="text-xs text-gray-500">Failed</div>
            </div>
          </div>

          {/* Document List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 text-sm">
              Document Status
            </h3>
            {progress.documents.length > 0 ? (
              progress.documents.map((doc, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    doc.status === "success"
                      ? "bg-green-50 border border-green-200"
                      : doc.status === "failed"
                        ? "bg-red-50 border border-red-200"
                        : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {doc.status === "success" ? (
                      <CheckCircle
                        className="text-green-500 flex-shrink-0"
                        size={18}
                      />
                    ) : doc.status === "failed" ? (
                      <XCircle
                        className="text-red-500 flex-shrink-0"
                        size={18}
                      />
                    ) : (
                      <Loader
                        className="text-blue-500 animate-spin flex-shrink-0"
                        size={18}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {doc.fileName || doc.docId}
                      </p>
                      {doc.identityEmail && (
                        <p className="text-xs text-gray-500 truncate">
                          {doc.identityEmail}
                        </p>
                      )}
                      {doc.message && (
                        <p className="text-xs text-gray-600 mt-1">
                          {doc.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Loader className="animate-spin mx-auto mb-2" size={32} />
                <p>Waiting for documents to process...</p>
              </div>
            )}
          </div>

          {/* Close Button (only show when completed or failed) */}
          {(progress.status === "completed" ||
            progress.status === "failed") && (
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              {progress.status === "completed" ? "Done" : "Close"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchProgressModal;
