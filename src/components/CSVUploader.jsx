import React, { useState, useCallback } from "react";
import { Upload, FileText, X, Check, AlertCircle } from "lucide-react";
import Papa from "papaparse";

const CSVUploader = ({ onDataLoaded, onError }) => {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const parseCSV = useCallback(
    (file) => {
      setIsLoading(true);
      setError(null);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            const errorMsg = results.errors[0].message;
            setError(errorMsg);
            if (onError) onError(errorMsg);
            setIsLoading(false);
            return;
          }

          if (results.data.length === 0) {
            const errorMsg = "CSV file is empty";
            setError(errorMsg);
            if (onError) onError(errorMsg);
            setIsLoading(false);
            return;
          }

          const headers = Object.keys(results.data[0]);
          setHeaders(headers);
          setCsvData(results.data);

          if (onDataLoaded) {
            onDataLoaded(results.data, headers);
          }

          setIsLoading(false);
        },
        error: (error) => {
          const errorMsg = error.message;
          setError(errorMsg);
          if (onError) onError(errorMsg);
          setIsLoading(false);
        },
      });
    },
    [onDataLoaded, onError]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0];
        if (
          droppedFile.type === "text/csv" ||
          droppedFile.name.endsWith(".csv")
        ) {
          setFile(droppedFile);
          parseCSV(droppedFile);
        } else {
          const errorMsg = "Please upload a CSV file";
          setError(errorMsg);
          if (onError) onError(errorMsg);
        }
      }
    },
    [parseCSV, onError]
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === "text/csv" ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
        parseCSV(selectedFile);
      } else {
        const errorMsg = "Please upload a CSV file";
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setError(null);
    if (onDataLoaded) {
      onDataLoaded([], []);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? "border-blue-500 bg-blue-50/10"
              : "border-white/20 hover:border-white/40"
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Upload size={32} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white mb-2">
                Upload CSV File
              </p>
              <p className="text-sm text-gray-400">
                Drag and drop your CSV file here, or click to browse
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                Choose File
              </span>
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {csvData.length} records found
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Headers Preview */}
          {headers.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Check size={16} className="text-green-400" />
                <h3 className="text-sm font-semibold text-white">
                  Available Fields ({headers.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {headers.map((header, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm"
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Data Preview */}
          {csvData.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                Data Preview (First 5 Records)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className="text-left p-2 text-gray-400 font-medium"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 5).map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        {headers.map((header, colIndex) => (
                          <td key={colIndex} className="p-2 text-gray-300">
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvData.length > 5 && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  ... and {csvData.length - 5} more records
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-400 mt-2">Parsing CSV file...</p>
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
