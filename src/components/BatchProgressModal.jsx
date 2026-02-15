import { useEffect, useState, useRef, useCallback } from "react"
import { CheckCircle, XCircle, Loader, Clock } from "lucide-react"
import useWalletStore from "../store/wallet"
import useFocusTrap from "../hooks/useFocusTrap"
import useEscapeKey from "../hooks/useEscapeKey"

const BatchProgressModal = ({
  sessionId,
  onClose,
  onComplete,
  onProgressUpdate,
}) => {
  // Get token from Zustand store
  const walletStore = useWalletStore()
  const token = walletStore.token
  const [progress, setProgress] = useState({
    totalDocuments: 0,
    processedDocuments: 0,
    successfulDocuments: 0,
    failedDocuments: 0,
    documents: [],
    status: "processing",
    currentStep: 0,
    currentMessage: "",
  })
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef(null)
  const isCompletedRef = useRef(false) // Track if batch completed successfully
  const isCloseable = progress.status === "completed" || progress.status === "failed"
  const trapRef = useFocusTrap(isCloseable)
  const handleEscapeClose = useCallback(() => { if (isCloseable && onClose) onClose() }, [isCloseable, onClose])
  useEscapeKey(handleEscapeClose, isCloseable)

  useEffect(() => {
    if (!sessionId) return

    // Reset completion flag
    isCompletedRef.current = false

    // Debug logging
    console.log("🔍 BatchProgressModal Debug:")
    console.log("  Session ID:", sessionId)
    console.log(
      "  Token from store:",
      token ? `${token.substring(0, 20)}...` : "undefined",
    )
    console.log("  Store state:", walletStore)

    if (!token) {
      console.error("❌ No authentication token available")
      console.log("💡 Try logging in again at /login")
      setProgress((prev) => ({
        ...prev,
        status: "failed",
        currentMessage: "Not logged in. Please refresh and login again.",
      }))
      return
    }

    let cancelled = false

    // Fetch short-lived SSE token, then open EventSource
    const connectSSE = async () => {
      let sseToken
      try {
        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
        console.log("📡 Fetching SSE token...")
        console.log("  API URL:", `${apiBaseUrl}/batch/sse-token`)
        console.log(
          "  Auth token:",
          token ? `${token.substring(0, 20)}...` : "undefined",
        )

        const resp = await fetch(`${apiBaseUrl}/batch/sse-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("  Response status:", resp.status)
        const data = await resp.json()
        console.log("  Response data:", data)

        if (!resp.ok) {
          throw new Error(data.message || `HTTP ${resp.status}`)
        }

        sseToken = data.token
        console.log("✅ SSE token obtained successfully")
      } catch (error) {
        console.error("❌ Failed to get SSE token:", error)
        // Fallback: use the main token if SSE token endpoint fails
        sseToken = token
        console.log("⚠️ Using main token as fallback")
      }

      if (cancelled) return

      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
      const eventSource = new EventSource(
        `${apiBaseUrl}/batch/progress/${sessionId}?token=${sseToken}`,
      )
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log("SSE connection opened")
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("Progress update:", data)

          if (data.type === "connected") {
            setIsConnected(true)
          } else if (data.type === "progress" && data.data) {
            setProgress(data.data)
            // Notify parent component of progress update
            if (onProgressUpdate) {
              onProgressUpdate(data.data)
            }
          } else if (data.type === "complete" && data.data) {
            console.log("✅ Batch processing completed!", data.data)
            isCompletedRef.current = true // Mark as completed
            setProgress(data.data)
            if (onComplete) {
              onComplete(data.data)
            }
            // Close the EventSource connection
            if (eventSourceRef.current) {
              eventSourceRef.current.close()
            }
            // Auto-close modal after 3 seconds on successful completion
            if (data.data.status === "completed") {
              setTimeout(() => {
                if (onClose) {
                  onClose()
                }
              }, 3000)
            }
          } else if (data.type === "error") {
            console.error("Progress error:", data.message)
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error)
        }
      }

      eventSource.onerror = (error) => {
        // Don't log error if we already completed successfully
        if (isCompletedRef.current) {
          console.log("✅ SSE connection closed after completion (normal)")
        } else {
          console.error("❌ SSE connection error:", error)
        }
        setIsConnected(false)
        eventSource.close()
      }
    }

    connectSSE()

    // Cleanup on unmount
    return () => {
      cancelled = true
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [sessionId, token, walletStore, onComplete, onClose, onProgressUpdate])

  const progressPercentage =
    progress.totalDocuments > 0
      ? (progress.processedDocuments / progress.totalDocuments) * 100
      : 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div ref={trapRef} role="dialog" aria-modal="true" aria-labelledby="batch-progress-title" className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div
          className={`p-6 text-white ${progress.status === "completed" ? "bg-gradient-to-r from-green-600 to-emerald-600" : progress.status === "failed" ? "bg-gradient-to-r from-red-600 to-rose-600" : "bg-gradient-to-r from-purple-600 to-blue-600"}`}
        >
          <h2 id="batch-progress-title" className="text-2xl font-bold">
            {progress.status === "completed"
              ? "✅ Batch Completed Successfully!"
              : progress.status === "failed"
                ? "❌ Batch Processing Failed"
                : "Processing Batch Upload"}
          </h2>
          <p className="text-purple-100 mt-1">
            {progress.status === "completed"
              ? `Successfully processed ${progress.successfulDocuments} documents`
              : progress.status === "failed"
                ? "Some documents failed to process"
                : isConnected
                  ? "Connected"
                  : "Connecting..."}
          </p>
          {progress.currentStep > 0 && progress.status === "processing" && (
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
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progressPercentage)} aria-valuemin={0} aria-valuemax={100} aria-label="Batch processing progress">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div aria-live="polite" className="sr-only">
            {progress.processedDocuments} of {progress.totalDocuments} documents processed. {progress.currentMessage}
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
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                progress.status === "completed"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              } text-white`}
            >
              {progress.status === "completed"
                ? "Done (closing in 3s...)"
                : "Close"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BatchProgressModal
