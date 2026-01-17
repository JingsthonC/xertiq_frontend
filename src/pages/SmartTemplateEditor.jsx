import React, { useState } from "react";
import showToast from "../utils/toast";
import { Wand2, Download, Eye, FileText, CheckCircle } from "lucide-react";
import NavigationHeader from "../components/NavigationHeader";
import Header from "../components/Header";
import TemplateBasedEditor from "../components/TemplateBasedEditor";
import pdfGenerator from "../services/pdfGenerator";

// Detect if running as Chrome extension
const isExtension = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.chrome !== "undefined" &&
    window.chrome.runtime &&
    window.chrome.runtime.id
  );
};

const SmartTemplateEditor = () => {
  const isExt = isExtension();
  const [template, setTemplate] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTemplateChange = (newTemplate) => {
    setTemplate(newTemplate);
  };

  const handleDataSourceChange = (newDataSource) => {
    setDataSource(newDataSource);
  };

  const handleSave = (savedTemplate) => {
    setTemplate(savedTemplate);
    console.log("Template saved:", savedTemplate);
    // You can add save to backend logic here
  };

  const handleGeneratePreview = () => {
    if (!template || !dataSource || dataSource.data.length === 0) {
      showToast.warning("Please upload template and data source first");
      return;
    }

    const sampleData = dataSource.data[0];
    const previewDataUrl = pdfGenerator.generatePreview(template, sampleData);
    setPreviewUrl(previewDataUrl);
  };

  const handleGeneratePDFs = async (separateFiles = false) => {
    if (!template || !dataSource || dataSource.data.length === 0) {
      showToast.warning("Please upload template and data source first");
      return;
    }

    setIsGenerating(true);

    try {
      if (separateFiles) {
        const pdfs = pdfGenerator.generateBatchCertificates(
          template,
          dataSource.data,
          true,
        );
        pdfGenerator.downloadBatchPDFs(
          pdfs,
          dataSource.data,
          `certificate_{{name}}_{{index}}.pdf`,
        );
      } else {
        const pdf = pdfGenerator.generateBatchCertificates(
          template,
          dataSource.data,
          false,
        );
        pdfGenerator.downloadPDF(pdf, `certificates_batch_${Date.now()}.pdf`);
      }

      showToast.success(
        `Successfully generated ${dataSource.data.length} certificate(s)!`,
      );
    } catch (error) {
      console.error("Error generating PDFs:", error);
      showToast.error(
        "Failed to generate PDFs. Please check your template and data.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (isExt) {
    return (
      <div className="h-full bg-gradient-to-br from-[#f7fafc] to-[#e6f2ff] text-gray-800 overflow-hidden flex flex-col">
        <NavigationHeader title="Smart Template Editor" showBack={true} />
        <div className="flex-1 overflow-y-auto p-4">
          <TemplateBasedEditor onSave={handleSave} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafc] to-[#e6f2ff]">
      <Header />
      <NavigationHeader title="Smart Template Editor" showBack={true} />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] p-3 rounded-xl shadow-lg">
                <Wand2 className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#2A1B5D] mb-2">
                  Smart Template Editor
                </h1>
                <p className="text-gray-600">
                  Upload a template (PDF, Word, or Image) and data source (CSV
                  or Excel) for intelligent field positioning
                </p>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <TemplateBasedEditor
            onSave={handleSave}
            onGenerate={handleGeneratePDFs}
            onTemplateChange={handleTemplateChange}
            onDataSourceChange={handleDataSourceChange}
          />

          {/* Preview & Generate Section */}
          {template && dataSource && (
            <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-[#2A1B5D] mb-4 flex items-center gap-2">
                <Eye className="text-[#3834A8]" size={24} />
                Preview & Generate
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preview */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[#2A1B5D] font-medium">Preview</h4>
                    <button
                      onClick={handleGeneratePreview}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-[#3834A8] hover:bg-[#2A1B5D] text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Eye size={16} />
                      Generate Preview
                    </button>
                  </div>

                  {previewUrl ? (
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <iframe
                        src={previewUrl}
                        className="w-full h-[400px] rounded"
                        title="Certificate Preview"
                      />
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <Eye size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Click "Generate Preview" to see your certificate
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Options */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-[#2A1B5D] font-medium mb-4">
                    Generate PDFs
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        Ready to generate {dataSource.totalRows} certificate(s)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => handleGeneratePDFs(false)}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <Download size={18} />
                        <span>
                          {isGenerating ? "Generating..." : "Single PDF"}
                        </span>
                      </button>

                      <button
                        onClick={() => handleGeneratePDFs(true)}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] hover:opacity-90 text-white rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <FileText size={18} />
                        <span>
                          {isGenerating ? "Generating..." : "Separate Files"}
                        </span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                      Single PDF combines all certificates. Separate files
                      creates individual PDFs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartTemplateEditor;
