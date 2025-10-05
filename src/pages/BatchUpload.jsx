import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
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
} from "lucide-react";
import apiService from "../services/api";
import Header from "../components/Header";
import NavigationHeader from "../components/NavigationHeader";

// Detect if running as Chrome extension
const isExtension = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.chrome !== "undefined" &&
    window.chrome.runtime &&
    window.chrome.runtime.id
  );
};

const BatchUpload = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState("");

  // Dropzone for PDF files
  const onDropPdf = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file, index) => ({
        id: `pdf-${Date.now()}-${index}`,
        file,
        name: file.name,
        size: file.size,
        type: "pdf",
      }));
      const updatedPdfFiles = [...pdfFiles, ...newFiles];
      setPdfFiles(updatedPdfFiles);

      // If we have CSV data, immediately compare
      if (csvData.length > 0) {
        const comparisonResult = compareFilesWithCsv(updatedPdfFiles, csvData);
        setComparison(comparisonResult);
      }
    },
    [pdfFiles, csvData]
  );

  // CSV Parser function
  const parseCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split("\n").filter((line) => line.trim() !== "");

          if (lines.length < 2) {
            reject(
              new Error("CSV file must have at least a header and one data row")
            );
            return;
          }

          const headers = lines[0]
            .split(",")
            .map((h) => h.trim().toLowerCase());

          // Only require filename column
          if (!headers.includes("filename")) {
            reject(new Error(`CSV must contain a 'filename' column`));
            return;
          }

          const data = lines.slice(1).map((line, index) => {
            const values = line.split(",").map((v) => v.trim());
            const row = {};
            headers.forEach((header, i) => {
              row[header] = values[i] || "";
            });
            row.rowIndex = index + 1;
            return row;
          });

          resolve(data);
        } catch (error) {
          reject(new Error("Failed to parse CSV file: " + error.message));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read CSV file"));
      reader.readAsText(file);
    });
  };

  // Compare PDF files with CSV data - simplified to only check if PDF filenames exist in CSV
  const compareFilesWithCsv = (pdfFiles, csvData) => {
    const pdfFilenames = pdfFiles.map((file) => file.name);

    const matched = [];
    const missingInCsv = [];

    // Only check if PDF filenames exist in CSV
    pdfFilenames.forEach((pdfFilename) => {
      const csvMatch = csvData.find((row) => row.filename === pdfFilename);
      if (csvMatch) {
        matched.push({
          filename: pdfFilename,
          csvData: csvMatch,
          pdfFile: pdfFiles.find((f) => f.name === pdfFilename),
        });
      } else {
        missingInCsv.push(pdfFilename);
      }
    });

    return {
      matched,
      missingInCsv,
      totalPdfs: pdfFilenames.length,
      totalCsvRows: csvData.length,
      isValid: missingInCsv.length === 0,
    };
  };

  // Dropzone for CSV file
  const onDropCsv = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setCsvFile({
          id: `csv-${Date.now()}`,
          file: file,
          name: file.name,
          size: file.size,
          type: "csv",
        });

        try {
          const data = await parseCsvFile(file);
          setCsvData(data);

          // If we have PDF files, immediately compare
          if (pdfFiles.length > 0) {
            const comparisonResult = compareFilesWithCsv(pdfFiles, data);
            setComparison(comparisonResult);
          }
        } catch (error) {
          setError(`CSV parsing error: ${error.message}`);
          setCsvData([]);
          setComparison(null);
        }
      }
    },
    [pdfFiles]
  );

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
  });

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
  });

  const removePdfFile = (fileId) => {
    const updatedFiles = pdfFiles.filter((f) => f.id !== fileId);
    setPdfFiles(updatedFiles);

    // Update comparison if CSV data exists
    if (csvData.length > 0) {
      const comparisonResult = compareFilesWithCsv(updatedFiles, csvData);
      setComparison(comparisonResult);
    } else if (updatedFiles.length === 0) {
      setComparison(null);
    }
  };

  const removeCsvFile = () => {
    setCsvFile(null);
    setCsvData([]);
    setComparison(null);
  };

  const handleBatchUpload = async () => {
    if (pdfFiles.length === 0) {
      setError("Please add PDF certificate files before uploading");
      return;
    }

    if (!csvFile) {
      setError("Please upload a CSV metadata file");
      return;
    }

    if (comparison && !comparison.isValid) {
      setError("Please resolve all file comparison issues before uploading");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();

      // Add PDF certificate files
      pdfFiles.forEach((fileData) => {
        formData.append("certificates", fileData.file);
      });

      // Add CSV metadata file
      formData.append("metadata", csvFile.file);

      const response = await apiService.createBatch(formData);
      setUploadResult(response);
      setPdfFiles([]);
      setCsvFile(null);
      setCsvData([]);
      setComparison(null);
    } catch (err) {
      console.error("Batch upload failed:", err);
      setError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const isExt = isExtension();

  if (isExt) {
    return (
      <div className="h-full bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23] text-white overflow-hidden flex flex-col">
        <NavigationHeader title="Batch Upload" />

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Compact Upload Result */}
          {uploadResult && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/40 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle size={16} className="text-green-400" />
                <h3 className="text-sm font-bold text-white">
                  Upload Successful!
                </h3>
              </div>
              <div className="space-y-2">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Batch ID</p>
                  <p className="text-white font-mono text-xs truncate">
                    {uploadResult.batchId}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Documents</p>
                  <p className="text-white font-bold">
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
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
                <FileText size={16} className="text-blue-400" />
                <span>PDF Certificates</span>
              </h3>
              <div
                {...getPdfRootProps()}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 cursor-pointer ${
                  isPdfDragActive
                    ? "border-blue-400 bg-blue-500/10"
                    : "border-gray-600 hover:border-gray-500 bg-white/5"
                }`}
              >
                <input {...getPdfInputProps()} />
                <FileText size={24} className="mx-auto mb-2 text-blue-400" />
                <p className="text-xs text-white mb-1">
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
                            className="text-blue-400 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-xs font-medium truncate">
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
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
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
                <p className="text-xs text-white mb-1">
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
                        <p className="text-white text-xs font-medium truncate">
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
                <h3 className="text-sm font-bold text-white">File Check</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-blue-500/10 border border-blue-400/40 rounded-lg p-2">
                  <p className="text-xs text-blue-300">PDFs</p>
                  <p className="text-sm font-bold text-white">
                    {comparison.totalPdfs}
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-400/40 rounded-lg p-2">
                  <p className="text-xs text-emerald-300">Matched</p>
                  <p className="text-sm font-bold text-white">
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
            <div className="sticky bottom-0 bg-gradient-to-t from-[#0a0e27] pt-2">
              <button
                onClick={handleBatchUpload}
                disabled={
                  isUploading ||
                  pdfFiles.length === 0 ||
                  !csvFile ||
                  (comparison && !comparison.isValid)
                }
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors font-semibold"
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23]">
      <Header />
      <NavigationHeader title="Batch Upload" />

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Batch Certificate Processing
            </h2>
            <p className="text-gray-300 mb-4">
              Upload PDF certificate files and CSV metadata for blockchain
              verification
            </p>

            {/* CSV Format Information */}
            <div className="bg-blue-500/10 border border-blue-400/40 rounded-xl p-4">
              <h4 className="text-blue-300 font-semibold mb-2">
                CSV Format Requirements:
              </h4>
              <p className="text-sm text-gray-300 mb-2">
                Your CSV file should contain columns for:{" "}
                <code className="bg-white/10 px-1 rounded">filename</code>,
                <code className="bg-white/10 px-1 rounded mx-1">
                  student_name
                </code>
                ,<code className="bg-white/10 px-1 rounded">email</code>,
                <code className="bg-white/10 px-1 rounded mx-1">birthday</code>,
                <code className="bg-white/10 px-1 rounded">gender</code>
              </p>
              <div className="bg-white/10 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-400 mb-1">
                  Example CSV content:
                </p>
                <div className="font-mono text-xs text-gray-300">
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
          {uploadResult && (
            <div className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/40 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle size={24} className="text-green-400" />
                <h3 className="text-xl font-bold text-white">
                  Batch Upload Successful!
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Batch ID</p>
                  <p className="text-white font-mono text-sm">
                    {uploadResult.batchId}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Documents Processed</p>
                  <p className="text-white font-bold text-xl">
                    {uploadResult.documentCount}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Merkle Root</p>
                  <p className="text-white font-mono text-xs break-all">
                    {uploadResult.merkleRoot}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Blockchain Network</p>
                  <p className="text-white">
                    {uploadResult.verification?.blockchain_network}
                  </p>
                </div>
              </div>

              {uploadResult.explorerUrl && (
                <a
                  href={uploadResult.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-lg px-4 py-2 text-blue-300 transition-colors"
                >
                  <ExternalLink size={16} />
                  <span>View on Solana Explorer</span>
                </a>
              )}

              {/* Documents List */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Processed Documents
                </h4>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {uploadResult.documents?.map((doc, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-medium">{doc.filename}</p>
                        <p className="text-sm text-gray-400">
                          {doc.student_name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.id && (
                          <a
                            href={`${window.location.origin}/verify?doc=${doc.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Verify
                          </a>
                        )}
                        <CheckCircle size={16} className="text-green-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-400/40 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-400" />
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Drag and Drop Zones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* PDF Files Upload */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <FileText size={24} className="text-blue-400" />
                <span>Certificate Files (PDF)</span>
              </h3>
              <div
                {...getPdfRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  isPdfDragActive
                    ? "border-blue-400 bg-blue-500/10"
                    : "border-gray-600 hover:border-gray-500 bg-white/5"
                }`}
              >
                <input {...getPdfInputProps()} />
                <FileText size={40} className="mx-auto mb-4 text-blue-400" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  {isPdfDragActive
                    ? "Drop PDF files here"
                    : "Upload PDF Certificates"}
                </h4>
                <p className="text-gray-400 mb-4">
                  Drag and drop PDF certificate files, or click to browse
                </p>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Choose PDF Files
                </button>
              </div>

              {/* PDF Files List */}
              {pdfFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-300">
                    PDF Files ({pdfFiles.length})
                  </p>
                  {pdfFiles.map((fileData) => (
                    <div
                      key={fileData.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText size={20} className="text-blue-400" />
                        <div>
                          <p className="text-white text-sm font-medium">
                            {fileData.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(fileData.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removePdfFile(fileData.id)}
                        className="text-red-400 hover:text-red-300 p-1"
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
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <FileSpreadsheet size={24} className="text-green-400" />
                <span>Metadata File (CSV)</span>
              </h3>
              <div
                {...getCsvRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  isCsvDragActive
                    ? "border-green-400 bg-green-500/10"
                    : "border-gray-600 hover:border-gray-500 bg-white/5"
                }`}
              >
                <input {...getCsvInputProps()} />
                <Database size={40} className="mx-auto mb-4 text-green-400" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  {isCsvDragActive
                    ? "Drop CSV file here"
                    : "Upload CSV Metadata"}
                </h4>
                <p className="text-gray-400 mb-4">
                  Upload a CSV file containing certificate metadata
                </p>
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Choose CSV File
                </button>
              </div>

              {/* CSV File Display */}
              {csvFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-300 mb-2">CSV File</p>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet size={20} className="text-green-400" />
                      <div>
                        <p className="text-white text-sm font-medium">
                          {csvFile.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(csvFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCsvFile}
                      className="text-red-400 hover:text-red-300 p-1"
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
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Search size={24} className="text-purple-400" />
                  <h3 className="text-xl font-bold text-white">
                    File Comparison Analysis
                  </h3>
                </div>

                {/* Comparison Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-500/10 border border-blue-400/40 rounded-xl p-4">
                    <p className="text-sm text-blue-300">Total PDF Files</p>
                    <p className="text-2xl font-bold text-white">
                      {comparison.totalPdfs}
                    </p>
                  </div>
                  <div className="bg-green-500/10 border border-green-400/40 rounded-xl p-4">
                    <p className="text-sm text-green-300">CSV Entries</p>
                    <p className="text-2xl font-bold text-white">
                      {comparison.totalCsvRows}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-400/40 rounded-xl p-4">
                    <p className="text-sm text-emerald-300">Matched Files</p>
                    <p className="text-2xl font-bold text-white">
                      {comparison.matched.length}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl p-4 ${
                      comparison.isValid
                        ? "bg-green-500/10 border border-green-400/40"
                        : "bg-red-500/10 border border-red-400/40"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        comparison.isValid ? "text-green-300" : "text-red-300"
                      }`}
                    >
                      Status
                    </p>
                    <div className="flex items-center space-x-2">
                      {comparison.isValid ? (
                        <CheckCircle size={20} className="text-green-400" />
                      ) : (
                        <AlertTriangle size={20} className="text-red-400" />
                      )}
                      <p
                        className={`font-bold ${
                          comparison.isValid ? "text-green-400" : "text-red-400"
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
                      <div className="bg-red-500/10 border border-red-400/40 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <AlertTriangle size={20} className="text-red-400" />
                          <h4 className="text-red-300 font-semibold">
                            PDF Files Missing in CSV (
                            {comparison.missingInCsv.length})
                          </h4>
                        </div>
                        <div className="space-y-1">
                          {comparison.missingInCsv.map((filename, index) => (
                            <p
                              key={index}
                              className="text-red-200 text-sm font-mono"
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
                  <div className="bg-green-500/10 border border-green-400/40 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileCheck size={20} className="text-green-400" />
                      <h4 className="text-green-300 font-semibold">
                        Successfully Matched Files ({comparison.matched.length})
                      </h4>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {comparison.matched.map((match, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText size={16} className="text-green-400" />
                              <div>
                                <p className="text-white text-sm font-medium">
                                  {match.filename}
                                </p>
                                <p className="text-green-200 text-xs">
                                  {match.csvData.identityemail &&
                                    match.csvData.identityemail}{" "}
                                  {match.csvData.certificatetype &&
                                    `• ${match.csvData.certificatetype}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
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
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl flex items-center space-x-3 mx-auto transition-colors text-lg font-semibold"
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
              <p className="text-sm text-gray-400 mt-2">
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
      </div>
    </div>
  );
};

export default BatchUpload;
