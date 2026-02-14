import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  ExternalLink,
  Database,
  FileSpreadsheet,
  Search,
  AlertTriangle,
  FileCheck,
  Download,
} from "lucide-react"
import apiService from "../services/api"
import Header from "../components/Header"
import NavigationHeader from "../components/NavigationHeader"
import BatchProgressModal from "../components/BatchProgressModal"

// Detect if running as Chrome extension
const isExtension = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.chrome !== "undefined" &&
    window.chrome.runtime &&
    window.chrome.runtime.id
  )
}

const BatchUpload = () => {
  const [pdfFiles, setPdfFiles] = useState([])
  const [csvFile, setCsvFile] = useState(null)
  const [csvData, setCsvData] = useState([])
  const [comparison, setComparison] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState("")
  const [sessionId, setSessionId] = useState(null)
  const [showProgress, setShowProgress] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState("DIPLOMA")
  const [documentTypes, setDocumentTypes] = useState([])
  const [requiredFields, setRequiredFields] = useState([])
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [progressToast, setProgressToast] = useState(null)

  // Fetch document types on mount
  useEffect(() => {
    fetchDocumentTypes()
  }, [])

  const fetchDocumentTypes = async () => {
    try {
      const response = await apiService.getDocumentTypes()
      setDocumentTypes(response || [])

      // Set initial required fields
      if (response && response.length > 0) {
        const selected = response.find((t) => t.value === selectedDocType)
        if (selected) {
          setRequiredFields(selected.requiredFields || [])
        }
      }
    } catch (error) {
      console.error("Failed to fetch document types:", error)
    }
  }

  const handleDocTypeChange = (docType) => {
    setSelectedDocType(docType)
    const selected = documentTypes.find((t) => t.value === docType)
    if (selected) {
      setRequiredFields(selected.requiredFields || [])
    }
  }

  const downloadSampleCsv = async () => {
    try {
      const csvContent = await apiService.downloadSampleCsv(selectedDocType)
      // Trigger download
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sample_${selectedDocType.toLowerCase()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to download sample CSV:", error)
      setError("Failed to download sample CSV")
    }
  }

  // Dropzone for PDF files
  const onDropPdf = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file, index) => ({
        id: `pdf-${Date.now()}-${index}`,
        file,
        name: file.name,
        size: file.size,
        type: "pdf",
      }))
      const updatedPdfFiles = [...pdfFiles, ...newFiles]
      setPdfFiles(updatedPdfFiles)

      // If we have CSV data, immediately compare
      if (csvData.length > 0) {
        const comparisonResult = compareFilesWithCsv(updatedPdfFiles, csvData)
        setComparison(comparisonResult)
      }
    },
    [pdfFiles, csvData],
  )

  // CSV Parser function
  const parseCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target.result
          const lines = text.split("\n").filter((line) => line.trim() !== "")

          if (lines.length < 2) {
            reject(
              new Error(
                "CSV file must have at least a header and one data row",
              ),
            )
            return
          }

          const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

          // Only require filename column
          if (!headers.includes("filename")) {
            reject(new Error(`CSV must contain a 'filename' column`))
            return
          }

          const data = lines.slice(1).map((line, index) => {
            const values = line.split(",").map((v) => v.trim())
            const row = {}
            headers.forEach((header, i) => {
              row[header] = values[i] || ""
            })
            row.rowIndex = index + 1
            return row
          })

          resolve(data)
        } catch (error) {
          reject(new Error("Failed to parse CSV file: " + error.message))
        }
      }
      reader.onerror = () => reject(new Error("Failed to read CSV file"))
      reader.readAsText(file)
    })
  }

  // Compare PDF files with CSV data - simplified to only check if PDF filenames exist in CSV
  const compareFilesWithCsv = (pdfFiles, csvData) => {
    const pdfFilenames = pdfFiles.map((file) => file.name)

    const matched = []
    const missingInCsv = []

    // Only check if PDF filenames exist in CSV
    pdfFilenames.forEach((pdfFilename) => {
      const csvMatch = csvData.find((row) => row.filename === pdfFilename)
      if (csvMatch) {
        matched.push({
          filename: pdfFilename,
          csvData: csvMatch,
          pdfFile: pdfFiles.find((f) => f.name === pdfFilename),
        })
      } else {
        missingInCsv.push(pdfFilename)
      }
    })

    return {
      matched,
      missingInCsv,
      totalPdfs: pdfFilenames.length,
      totalCsvRows: csvData.length,
      isValid: missingInCsv.length === 0,
    }
  }

  // Dropzone for CSV file
  const onDropCsv = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setCsvFile({
          id: `csv-${Date.now()}`,
          file: file,
          name: file.name,
          size: file.size,
          type: "csv",
        })

        try {
          const data = await parseCsvFile(file)
          setCsvData(data)

          // If we have PDF files, immediately compare
          if (pdfFiles.length > 0) {
            const comparisonResult = compareFilesWithCsv(pdfFiles, data)
            setComparison(comparisonResult)
          }
        } catch (error) {
          setError(`CSV parsing error: ${error.message}`)
          setCsvData([])
          setComparison(null)
        }
      }
    },
    [pdfFiles],
  )

  const {
    getRootProps: getPdfRootProps,
    getInputProps: getPdfInputProps,
    isDragActive: isPdfDragActive,
  } = useDropzone({
    onDrop: onDropPdf,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  })

  const {
    getRootProps: getCsvRootProps,
    getInputProps: getCsvInputProps,
    isDragActive: isCsvDragActive,
  } = useDropzone({
    onDrop: onDropCsv,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    multiple: false,
  })

  const removePdfFile = (fileId) => {
    const updatedFiles = pdfFiles.filter((f) => f.id !== fileId)
    setPdfFiles(updatedFiles)

    // Update comparison if CSV data exists
    if (csvData.length > 0) {
      const comparisonResult = compareFilesWithCsv(updatedFiles, csvData)
      setComparison(comparisonResult)
    } else if (updatedFiles.length === 0) {
      setComparison(null)
    }
  }

  const removeCsvFile = () => {
    setCsvFile(null)
    setCsvData([])
    setComparison(null)
  }

  const handleBatchUpload = async () => {
    if (pdfFiles.length === 0) {
      setError("Please add PDF certificate files before uploading")
      return
    }

    if (!csvFile) {
      setError("Please upload a CSV metadata file")
      return
    }

    if (comparison && !comparison.isValid) {
      setError("Please resolve all file comparison issues before uploading")
      return
    }

    setIsUploading(true)
    setError("")
    setUploadResult(null)

    try {
      const formData = new FormData()

      // Add document type
      formData.append("docType", selectedDocType)

      // Add PDF certificate files
      pdfFiles.forEach((fileData) => {
        formData.append("certificates", fileData.file)
      })

      // Add CSV metadata file
      formData.append("metadata", csvFile.file)

      // Get session ID from backend
      const response = await apiService.createBatch(formData)

      // Backend now returns sessionId immediately
      if (response.sessionId) {
        setSessionId(response.sessionId)
        setShowProgress(true)
        // Initialize progress toast
        setProgressToast({
          processedDocuments: 0,
          totalDocuments: pdfFiles.length,
          percentage: 0,
          currentMessage: "Starting batch processing...",
        })
      } else {
        // Fallback for old response format
        setUploadResult(response)
        setPdfFiles([])
        setCsvFile(null)
        setCsvData([])
        setComparison(null)
      }
    } catch (err) {
      console.error("Batch upload failed:", err)
      const errorMsg =
        err.response?.data?.message || "Upload failed. Please try again."
      setError(errorMsg)
      setProgressToast(null) // Clear progress toast on error

      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setError("")
      }, 5000)
    } finally {
      setIsUploading(false)
    }
  }

  const handleProgressUpdate = (progressData) => {
    // Update toast with real-time progress
    if (progressData && progressData.totalDocuments > 0) {
      const percentage = Math.round(
        (progressData.processedDocuments / progressData.totalDocuments) * 100,
      )
      setProgressToast({
        processedDocuments: progressData.processedDocuments || 0,
        totalDocuments: progressData.totalDocuments || 0,
        percentage,
        currentMessage: progressData.currentMessage || "Processing...",
      })
    }
  }

  const handleProgressComplete = (progressData) => {
    // Progress data from SSE already has all the fields at root level
    console.log("✅ Progress complete:", progressData)

    // The SSE sends data with all fields at root level, not nested under finalResult
    setUploadResult({
      batchId: progressData.batchId || "N/A",
      documentCount: progressData.successfulDocuments || 0,
      totalDocuments: progressData.totalDocuments || 0,
      failedDocuments: progressData.failedDocuments || 0,
      documents: progressData.documents || [],
      status: progressData.status,
      duration: progressData.duration,
    })

    // Show success notification and hide progress toast
    if (
      progressData.status === "completed" &&
      progressData.successfulDocuments > 0
    ) {
      setProgressToast(null)
      setSuccessCount(progressData.successfulDocuments) // Store count before showing notification
      setShowSuccessNotification(true)
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowSuccessNotification(false)
      }, 5000)
    }

    setShowProgress(false)
    setPdfFiles([])
    setCsvFile(null)
    setCsvData([])
    setComparison(null)
  }

  const handleProgressClose = () => {
    setShowProgress(false)
    setSessionId(null)
    setProgressToast(null) // Clear progress toast when modal closes
  }

  const isExt = isExtension()

  if (isExt) {
    return (
      <div className="h-full bg-lightest text-dark overflow-hidden flex flex-col">
        <NavigationHeader title="Batch Upload" />

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Compact Upload Result */}
          {uploadResult && (
            <div className="bg-success-bg border border-success-border rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle size={16} className="text-green-400" />
                <h3 className="text-sm font-bold text-dark">
                  Upload Successful!
                </h3>
              </div>
              <div className="space-y-2">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Batch ID</p>
                  <p className="text-dark font-mono text-xs truncate">
                    {uploadResult.batchId}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Documents</p>
                  <p className="text-dark font-bold">
                    {uploadResult.documentCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/40 rounded-xl p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Compact Upload Areas */}
          <div className="space-y-3">
            {/* PDF Upload */}
            <div>
              <h3 className="text-sm font-semibold text-dark mb-2 flex items-center space-x-2">
                <FileText size={16} className="text-[#8B5CF6]" />
                <span>PDF Certificates</span>
              </h3>
              <div
                {...getPdfRootProps()}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 cursor-pointer ${
                  isPdfDragActive
                    ? "border-[#8B5CF6] bg-[#3B82F6]/10"
                    : "border-gray-600 hover:border-gray-500 bg-white/5"
                }`}
              >
                <input {...getPdfInputProps()} />
                <FileText size={24} className="mx-auto mb-2 text-[#8B5CF6]" />
                <p className="text-xs text-dark mb-1">
                  {isPdfDragActive ? "Drop PDFs here" : "Upload PDFs"}
                </p>
                <p className="text-xs text-gray-400">Drag & drop or click</p>
              </div>

              {/* PDF Files List - Compact */}
              {pdfFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-300">
                    Files ({pdfFiles.length})
                  </p>
                  <div className="max-h-20 overflow-y-auto space-y-1">
                    {pdfFiles.map((fileData) => (
                      <div
                        key={fileData.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText
                            size={12}
                            className="text-[#8B5CF6] flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-dark text-xs font-medium truncate">
                              {fileData.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {(fileData.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removePdfFile(fileData.id)}
                          className="text-red-400 hover:text-red-300 p-1 flex-shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CSV Upload */}
            <div>
              <h3 className="text-sm font-semibold text-dark mb-2 flex items-center space-x-2">
                <FileSpreadsheet size={16} className="text-green-400" />
                <span>CSV Metadata</span>
              </h3>
              <div
                {...getCsvRootProps()}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 cursor-pointer ${
                  isCsvDragActive
                    ? "border-green-400 bg-green-500/10"
                    : "border-gray-600 hover:border-gray-500 bg-white/5"
                }`}
              >
                <input {...getCsvInputProps()} />
                <Database size={24} className="mx-auto mb-2 text-green-400" />
                <p className="text-xs text-dark mb-1">
                  {isCsvDragActive ? "Drop CSV here" : "Upload CSV"}
                </p>
                <p className="text-xs text-gray-400">Metadata file</p>
              </div>

              {/* CSV File Display - Compact */}
              {csvFile && (
                <div className="mt-2">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <FileSpreadsheet
                        size={12}
                        className="text-green-400 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-dark text-xs font-medium truncate">
                          {csvFile.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(csvFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCsvFile}
                      className="text-red-400 hover:text-red-300 p-1 flex-shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compact Comparison Results */}
          {comparison && (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-3">
                <Search size={14} className="text-purple-400" />
                <h3 className="text-sm font-bold text-dark">File Check</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#3B82F6]/10 border border-[#8B5CF6]/40 rounded-lg p-2">
                  <p className="text-xs text-[#8B5CF6]">PDFs</p>
                  <p className="text-sm font-bold text-dark">
                    {comparison.totalPdfs}
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-400/40 rounded-lg p-2">
                  <p className="text-xs text-emerald-300">Matched</p>
                  <p className="text-sm font-bold text-dark">
                    {comparison.matched.length}
                  </p>
                </div>
              </div>

              <div
                className={`rounded-lg p-2 flex items-center space-x-2 ${
                  comparison.isValid
                    ? "bg-green-500/10 border border-green-400/40"
                    : "bg-red-500/10 border border-red-400/40"
                }`}
              >
                {comparison.isValid ? (
                  <CheckCircle size={14} className="text-green-400" />
                ) : (
                  <AlertTriangle size={14} className="text-red-400" />
                )}
                <p
                  className={`text-xs font-bold ${
                    comparison.isValid ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {comparison.isValid
                    ? "Ready to Upload"
                    : `${comparison.missingInCsv.length} Issues`}
                </p>
              </div>

              {/* Show issues in compact format */}
              {!comparison.isValid && comparison.missingInCsv.length > 0 && (
                <div className="mt-2 bg-red-500/10 border border-red-400/40 rounded-lg p-2">
                  <p className="text-xs text-red-300 font-medium mb-1">
                    Missing in CSV:
                  </p>
                  <div className="max-h-16 overflow-y-auto">
                    {comparison.missingInCsv.map((filename, index) => (
                      <p
                        key={index}
                        className="text-xs text-red-200 font-mono truncate"
                      >
                        • {filename}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compact Upload Button */}
          {(pdfFiles.length > 0 || csvFile) && (
            <div className="sticky bottom-0 bg-lightest pt-2">
              <button
                onClick={handleBatchUpload}
                disabled={
                  isUploading ||
                  pdfFiles.length === 0 ||
                  !csvFile ||
                  (comparison && !comparison.isValid)
                }
                className="w-full bg-dark hover:bg-darker disabled:opacity-50 disabled:cursor-not-allowed text-lightest px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors font-semibold"
              >
                {isUploading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span className="text-sm">Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span className="text-sm">Process Batch</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafc] to-[#e6f2ff]">
      <Header />
      <NavigationHeader title="Batch Upload" />

      {/* Success Toast Notification */}
      {showSuccessNotification && (
        <div className="fixed top-6 right-6 z-50 transition-all duration-300 ease-out">
          <div className="bg-white border border-green-200 shadow-lg rounded-lg px-5 py-4 flex items-start space-x-3 max-w-md">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">
                Batch Complete!
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                {successCount} certificate(s) processed successfully
              </p>
            </div>
            <button
              onClick={() => setShowSuccessNotification(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Progress Toast Notification */}
      {progressToast && (
        <div className="fixed top-6 right-6 z-50 transition-all duration-300 ease-out">
          <div className="bg-white border border-blue-200 shadow-lg rounded-lg px-5 py-4 max-w-md">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader size={20} className="text-blue-600 animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  Processing Documents
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {progressToast.processedDocuments} of{" "}
                  {progressToast.totalDocuments} documents
                </p>
                {progressToast.currentMessage && (
                  <p className="text-xs text-gray-500 mt-1">
                    {progressToast.currentMessage}
                  </p>
                )}
                {/* Progress Bar */}
                <div className="mt-2 bg-gray-200 rounded-full h-2 w-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progressToast.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {progressToast.percentage}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast Notification */}
      {error && (
        <div className="fixed top-6 right-6 z-50 transition-all duration-300 ease-out">
          <div className="bg-white border border-red-200 shadow-lg rounded-lg px-5 py-4 flex items-start space-x-3 max-w-md">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">
                Upload Failed
              </p>
              <p className="text-sm text-gray-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#1E40AF] mb-2">
              Batch Certificate Processing
            </h2>
            <p className="text-gray-600 mb-4">
              Upload PDF certificate files and CSV metadata for blockchain
              verification
            </p>

            {/* Document Type Selector */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#1E40AF] mb-4">
                Step 1: Select Document Type
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {documentTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleDocTypeChange(type.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedDocType === type.value
                        ? "border-[#3B82F6] bg-[#3B82F6]/10 shadow-md"
                        : "border-gray-200 bg-white hover:border-[#3B82F6]/50 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="text-sm font-semibold text-[#1E40AF] mb-1">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500">{type.category}</div>
                  </button>
                ))}
              </div>

              {selectedDocType && (
                <div className="p-4 bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#7C3AED] mb-2">
                        Required Fields: {requiredFields.join(", ")}
                      </p>
                      <p className="text-xs text-gray-600">
                        Your CSV must include these fields along with the
                        filename column.
                      </p>
                    </div>
                    <button
                      onClick={downloadSampleCsv}
                      className="ml-4 px-4 py-2 bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 border border-[#7C3AED]/30 rounded-lg text-[#7C3AED] text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <Download size={16} />
                      Sample CSV
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CSV Format Information */}
            <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-xl p-4">
              <h4 className="text-[#3B82F6] font-semibold mb-2">
                CSV Format Requirements:
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                Your CSV file should contain columns for:{" "}
                <code className="bg-gray-200 px-1 rounded">filename</code>,
                <code className="bg-gray-200 px-1 rounded mx-1">
                  student_name
                </code>
                ,<code className="bg-gray-200 px-1 rounded">email</code>,
                <code className="bg-gray-200 px-1 rounded mx-1">birthday</code>,
                <code className="bg-gray-200 px-1 rounded">gender</code>
              </p>
              <div className="bg-white rounded-lg p-3 mt-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">
                  Example CSV content:
                </p>
                <div className="font-mono text-xs text-gray-700">
                  <p>filename,student_name,email,birthday,gender</p>
                  <p>
                    certificate1.pdf,John Doe,john@example.com,1990-01-15,male
                  </p>
                  <p>
                    certificate2.pdf,Jane
                    Smith,jane@example.com,1992-03-20,female
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Result */}
          {uploadResult &&
            uploadResult.batchId &&
            uploadResult.batchId !== "N/A" && (
              <div className="mb-8 bg-green-50 border border-green-300 rounded-2xl p-6 shadow-md">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle size={24} className="text-green-500" />
                  <h3 className="text-xl font-bold text-[#1E40AF]">
                    Batch Upload Successful!
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Batch ID</p>
                    <p className="text-[#1E40AF] font-mono text-sm">
                      {uploadResult.batchId}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Documents Processed</p>
                    <p className="text-[#1E40AF] font-bold text-xl">
                      {uploadResult.documentCount}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Merkle Root</p>
                    <p className="text-[#1E40AF] font-mono text-xs break-all">
                      {uploadResult.merkleRoot}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Blockchain Network</p>
                    <p className="text-[#1E40AF]">
                      {uploadResult.verification?.blockchain_network}
                    </p>
                  </div>
                </div>

                {uploadResult.explorerUrl && (
                  <a
                    href={uploadResult.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-[#3B82F6] hover:bg-[#1E40AF] rounded-lg px-4 py-2 text-white transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span>View on Solana Explorer</span>
                  </a>
                )}

                {/* Documents List */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-[#1E40AF] mb-3">
                    Processed Documents
                  </h4>
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {uploadResult.documents?.map((doc, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 flex items-center justify-between border border-gray-200"
                      >
                        <div>
                          <p className="text-[#1E40AF] font-medium">
                            {doc.filename}
                          </p>
                          <p className="text-sm text-gray-500">
                            {doc.student_name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.docId && (
                            <a
                              href={`${window.location.origin}/verify?doc=${doc.docId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#3B82F6] hover:text-[#1E40AF] text-sm"
                            >
                              Verify
                            </a>
                          )}
                          <CheckCircle size={16} className="text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-300 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-500" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Drag and Drop Zones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* PDF Files Upload */}
            <div>
              <h3 className="text-xl font-semibold text-[#1E40AF] mb-4 flex items-center space-x-2">
                <FileText size={24} className="text-[#3B82F6]" />
                <span>Certificate Files (PDF)</span>
              </h3>
              <div
                {...getPdfRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  isPdfDragActive
                    ? "border-[#3B82F6] bg-[#3B82F6]/10"
                    : "border-gray-300 hover:border-gray-400 bg-white"
                }`}
              >
                <input {...getPdfInputProps()} />
                <FileText size={40} className="mx-auto mb-4 text-[#3B82F6]" />
                <h4 className="text-lg font-semibold text-[#1E40AF] mb-2">
                  {isPdfDragActive
                    ? "Drop PDF files here"
                    : "Upload PDF Certificates"}
                </h4>
                <p className="text-gray-500 mb-4">
                  Drag and drop PDF certificate files, or click to browse
                </p>
                <button
                  type="button"
                  className="bg-[#3B82F6] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Choose PDF Files
                </button>
              </div>

              {/* PDF Files List */}
              {pdfFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    PDF Files ({pdfFiles.length})
                  </p>
                  {pdfFiles.map((fileData) => (
                    <div
                      key={fileData.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText size={20} className="text-[#3B82F6]" />
                        <div>
                          <p className="text-[#1E40AF] text-sm font-medium">
                            {fileData.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(fileData.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removePdfFile(fileData.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CSV Metadata Upload */}
            <div>
              <h3 className="text-xl font-semibold text-[#1E40AF] mb-4 flex items-center space-x-2">
                <FileSpreadsheet size={24} className="text-green-500" />
                <span>Metadata File (CSV)</span>
              </h3>
              <div
                {...getCsvRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  isCsvDragActive
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400 bg-white"
                }`}
              >
                <input {...getCsvInputProps()} />
                <Database size={40} className="mx-auto mb-4 text-green-500" />
                <h4 className="text-lg font-semibold text-[#1E40AF] mb-2">
                  {isCsvDragActive
                    ? "Drop CSV file here"
                    : "Upload CSV Metadata"}
                </h4>
                <p className="text-gray-500 mb-4">
                  Upload a CSV file containing certificate metadata
                </p>
                <button
                  type="button"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Choose CSV File
                </button>
              </div>

              {/* CSV File Display */}
              {csvFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">CSV File</p>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet size={20} className="text-green-500" />
                      <div>
                        <p className="text-[#1E40AF] text-sm font-medium">
                          {csvFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(csvFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCsvFile}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Comparison Checker */}
          {comparison && (
            <div className="mb-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
                <div className="flex items-center space-x-3 mb-6">
                  <Search size={24} className="text-[#3B82F6]" />
                  <h3 className="text-xl font-bold text-[#1E40AF]">
                    File Comparison Analysis
                  </h3>
                </div>

                {/* Comparison Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-xl p-4">
                    <p className="text-sm text-[#3B82F6]">Total PDF Files</p>
                    <p className="text-2xl font-bold text-[#1E40AF]">
                      {comparison.totalPdfs}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-300 rounded-xl p-4">
                    <p className="text-sm text-green-600">CSV Entries</p>
                    <p className="text-2xl font-bold text-[#1E40AF]">
                      {comparison.totalCsvRows}
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4">
                    <p className="text-sm text-emerald-600">Matched Files</p>
                    <p className="text-2xl font-bold text-[#1E40AF]">
                      {comparison.matched.length}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl p-4 ${
                      comparison.isValid
                        ? "bg-green-50 border border-green-300"
                        : "bg-red-50 border border-red-300"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        comparison.isValid ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Status
                    </p>
                    <div className="flex items-center space-x-2">
                      {comparison.isValid ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <AlertTriangle size={20} className="text-red-500" />
                      )}
                      <p
                        className={`font-bold ${
                          comparison.isValid ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {comparison.isValid ? "Valid" : "Issues Found"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Issues Section */}
                {!comparison.isValid && (
                  <div className="space-y-4 mb-6">
                    {/* Missing in CSV */}
                    {comparison.missingInCsv.length > 0 && (
                      <div className="bg-red-50 border border-red-300 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <AlertTriangle size={20} className="text-red-500" />
                          <h4 className="text-red-700 font-semibold">
                            PDF Files Missing in CSV (
                            {comparison.missingInCsv.length})
                          </h4>
                        </div>
                        <div className="space-y-1">
                          {comparison.missingInCsv.map((filename, index) => (
                            <p
                              key={index}
                              className="text-red-600 text-sm font-mono"
                            >
                              • {filename}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Matched Files Section */}
                {comparison.matched.length > 0 && (
                  <div className="bg-green-50 border border-green-300 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileCheck size={20} className="text-green-500" />
                      <h4 className="text-green-700 font-semibold">
                        Successfully Matched Files ({comparison.matched.length})
                      </h4>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {comparison.matched.map((match, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText size={16} className="text-green-500" />
                              <div>
                                <p className="text-[#1E40AF] text-sm font-medium">
                                  {match.filename}
                                </p>
                                <p className="text-green-600 text-xs">
                                  {match.csvData.identityemail &&
                                    match.csvData.identityemail}{" "}
                                  {match.csvData.certificatetype &&
                                    `• ${match.csvData.certificatetype}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Row {match.csvData.rowIndex}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {(pdfFiles.length > 0 || csvFile) && (
            <div className="mb-8 text-center">
              <button
                onClick={handleBatchUpload}
                disabled={
                  isUploading ||
                  pdfFiles.length === 0 ||
                  !csvFile ||
                  (comparison && !comparison.isValid)
                }
                className="bg-[#3B82F6] hover:bg-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl flex items-center space-x-3 mx-auto transition-colors text-lg font-semibold shadow-lg"
              >
                {isUploading ? (
                  <>
                    <Loader size={24} className="animate-spin" />
                    <span>Processing Batch...</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} />
                    <span>Process Certificate Batch</span>
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                {pdfFiles.length === 0 && "Upload PDF files and "}
                {!csvFile && "Upload CSV metadata file to "}
                {comparison &&
                  !comparison.isValid &&
                  "Resolve file comparison issues to "}
                {pdfFiles.length > 0 &&
                  csvFile &&
                  (!comparison || comparison.isValid) &&
                  "Ready to "}
                process batch
              </p>
            </div>
          )}
        </div>

        {/* Progress Modal */}
        {showProgress && sessionId && (
          <BatchProgressModal
            sessionId={sessionId}
            onClose={handleProgressClose}
            onComplete={handleProgressComplete}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </div>
    </div>
  )
}

export default BatchUpload
