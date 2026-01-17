import React, { useState, useCallback, useEffect } from "react";
import KonvaPdfDesigner from "../components/KonvaPdfDesigner";
import pdfGenerator from "../services/pdfGenerator";
import canvasPdfGenerator from "../services/canvasPdfGenerator";
import templateStorage from "../services/templateStorage";
import thumbnailGenerator from "../services/thumbnailGenerator";
import showToast from "../utils/toast";
import {
  Download,
  X,
  Palette,
  Save,
  FolderOpen,
  Sparkles,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const DesignerComparison = () => {
  const [activeDesigner] = useState("konva"); // Only Konva designer
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewData, setPreviewData] = useState(null); // { pdf, filename, recipient }
  const [batchPreviews, setBatchPreviews] = useState([]); // For batch preview
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateThumbnails, setTemplateThumbnails] = useState({}); // Store thumbnails by template name
  const [templateName, setTemplateName] = useState("POC Test Certificate");
  const [loadedTemplate, setLoadedTemplate] = useState(null); // Template to pass to Konva
  const [showSidebar, setShowSidebar] = useState(false); // Sidebar visibility - hidden by default
  const [template, setTemplate] = useState({
    name: "POC Test Certificate",
    orientation: "landscape",
    format: "a4",
    backgroundColor: "#ffffff",
    elements: [], // Start with empty canvas
  });

  const [csvData] = useState([
    {
      name: "John Doe",
      lastname: "Doe",
      email: "john.doe@example.com",
      course: "Web Development",
      date: "October 17 2025",
      grade: "A+",
    },
  ]);

  const handleGeneratePreview = () => {
    try {
      const previewDataUrl = pdfGenerator.generatePreview(template, csvData[0]);
      const win = window.open();
      win.document.write(`
        <html>
          <head><title>Certificate Preview</title></head>
          <body style="margin:0">
            <iframe src="${previewDataUrl}" style="width:100%;height:100vh;border:none"></iframe>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error generating preview:", error);
      showToast.error("Error generating preview. Check console for details.");
    }
  };

  const handleDownloadPDF = () => {
    try {
      const pdf = pdfGenerator.generateSingleCertificate(template, csvData[0]);
      pdfGenerator.downloadPDF(pdf, "test-certificate.pdf");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showToast.error("Error downloading PDF. Check console for details.");
    }
  };

  const handleTemplateChange = useCallback(async (updatedTemplate) => {
    // Update the shared template state
    setTemplate(updatedTemplate);

    // Update loadedTemplate to keep them in sync
    setLoadedTemplate(updatedTemplate);

    // Check if we should use canvas-based generation for pixel-perfect accuracy
    const useCanvas =
      updatedTemplate.useCanvasGeneration && updatedTemplate.fabricCanvas;

    // Handle batch PDF generation
    if (updatedTemplate.batchGenerate && updatedTemplate.csvData) {
      const csvRecords = updatedTemplate.csvData;
      const batchInfo = updatedTemplate.batchInfo || null;

      try {
        let pdfs;

        if (useCanvas) {
          // Use canvas-based generation for pixel-perfect accuracy
          console.log(
            "🎨 Using canvas-based generation for pixel-perfect PDFs",
          );
          console.log("📦 Batch Info:", batchInfo);
          pdfs = await canvasPdfGenerator.generateBatch(
            updatedTemplate.fabricCanvas,
            updatedTemplate,
            csvRecords,
            batchInfo, // Pass batch info for course/batch name
          );
        } else {
          // Fallback to element-based generation
          pdfs = csvRecords.map((record, index) => {
            // Merge batch info with record data
            const mergedData = { ...record };
            if (batchInfo) {
              if (batchInfo.courseName) {
                mergedData.course = batchInfo.courseName;
                mergedData.courseName = batchInfo.courseName;
              }
              if (batchInfo.batchName) {
                mergedData.batch = batchInfo.batchName;
                mergedData.batchName = batchInfo.batchName;
              }
            }

            const pdf = pdfGenerator.generateSingleCertificate(
              updatedTemplate,
              mergedData,
            );
            return {
              pdf,
              filename: `certificate_${
                record.name || record.fullname || index + 1
              }.pdf`,
              recipient: record,
            };
          });
        }

        // Store for preview instead of downloading immediately
        setBatchPreviews(pdfs);
        setShowPreviewModal(true);
      } catch (error) {
        console.error("Error generating batch PDFs:", error);
        showToast.error("Error generating PDFs. Check console for details.");
      }

      // Clear the flags
      delete updatedTemplate.batchGenerate;
      delete updatedTemplate.csvData;
      delete updatedTemplate.batchInfo;
    }

    // Handle single PDF generation
    if (updatedTemplate.generateSingle && updatedTemplate.currentRecipient) {
      const recipient = updatedTemplate.currentRecipient;

      try {
        let pdf;

        if (useCanvas) {
          // Use canvas-based generation for pixel-perfect accuracy
          console.log("🎨 Using canvas-based generation for pixel-perfect PDF");
          pdf = await canvasPdfGenerator.generateFromCanvas(
            updatedTemplate.fabricCanvas,
            updatedTemplate,
            recipient,
          );
        } else {
          // Fallback to element-based generation
          pdf = pdfGenerator.generateSingleCertificate(
            updatedTemplate,
            recipient,
          );
        }

        const filename = `certificate_${
          recipient.name || recipient.fullname || "recipient"
        }.pdf`;

        // Create preview URL
        const pdfBlob = pdf.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Store for preview instead of downloading immediately
        setPreviewData({ pdf, filename, recipient });
        setPreviewPdfUrl(pdfUrl);
        setShowPreviewModal(true);
      } catch (error) {
        console.error("Error generating PDF:", error);
        showToast.error("Error generating PDF. Check console for details.");
      }

      // Clear the flags
      delete updatedTemplate.generateSingle;
      delete updatedTemplate.currentRecipient;
    }
  }, []);

  const downloadSinglePDF = () => {
    if (previewData) {
      pdfGenerator.downloadPDF(previewData.pdf, previewData.filename);
    }
  };

  const downloadAllPDFs = () => {
    if (batchPreviews.length > 0) {
      batchPreviews.forEach(({ pdf, filename }) => {
        pdfGenerator.downloadPDF(pdf, filename);
      });
      showToast.success(
        `Successfully downloaded ${batchPreviews.length} certificate(s)!`,
      );
    }
  };

  const closePreview = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setShowPreviewModal(false);
    setPreviewPdfUrl(null);
    setPreviewData(null);
    setBatchPreviews([]);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      showToast.warning("Please enter a template name");
      setShowSaveDialog(true);
      return;
    }

    const templateToSave = {
      ...template,
      name: templateName,
    };

    const success = templateStorage.saveTemplate(templateToSave);
    if (success) {
      showToast.success(`Template "${templateName}" saved successfully!`);
      setShowSaveDialog(false);
      loadSavedTemplates(); // Refresh the list
    } else {
      showToast.error("Failed to save template");
    }
  };

  const loadSavedTemplates = async () => {
    const templates = templateStorage.getAllTemplates();
    setSavedTemplates(templates);

    // Generate thumbnails for all templates
    // Use dimensions that will fill the preview container properly
    const thumbnails = {};
    for (const tmpl of templates) {
      try {
        // Generate larger thumbnail for better quality, it will be scaled down by CSS
        // Container is aspect-[3/2], so generate at 600x400 for crisp display
        const thumbnail = await thumbnailGenerator.generateFromTemplate(
          tmpl,
          600,
          400,
        );
        thumbnails[tmpl.name] = thumbnail;
      } catch (error) {
        console.error(`Failed to generate thumbnail for ${tmpl.name}:`, error);
      }
    }
    setTemplateThumbnails(thumbnails);
  };

  const handleLoadTemplate = async (templateToLoad) => {
    setTemplate(templateToLoad);
    setTemplateName(templateToLoad.name);
    setLoadedTemplate(templateToLoad); // Pass to Konva

    // Regenerate thumbnail for this template to ensure it's up to date
    try {
      const thumbnail = await thumbnailGenerator.generateFromTemplate(
        templateToLoad,
        600,
        400,
      );
      setTemplateThumbnails((prev) => ({
        ...prev,
        [templateToLoad.name]: thumbnail,
      }));
    } catch (error) {
      console.error(
        `Failed to regenerate thumbnail for ${templateToLoad.name}:`,
        error,
      );
    }
  };

  const handleDeleteTemplate = (templateName) => {
    if (window.confirm(`Delete template "${templateName}"?`)) {
      const success = templateStorage.deleteTemplate(templateName);
      if (success) {
        loadSavedTemplates();
        showToast.success("Template deleted!");
      }
    }
  };

  // Initialize loadedTemplate if null (for Konva designer)
  useEffect(() => {
    // Initialize loadedTemplate with default template if it's null
    if (!loadedTemplate && template) {
      setLoadedTemplate(template);
    }
  }, [template, loadedTemplate]);

  // Sync loadedTemplate with template
  useEffect(() => {
    if (template && !loadedTemplate) {
      setLoadedTemplate(template);
    }
  }, [template, loadedTemplate]);

  // Load templates on mount
  useEffect(() => {
    loadSavedTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafc] to-[#e6f2ff] p-4">
      <div className="max-w-[1920px] mx-auto">
        {/* Compact Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] rounded-xl shadow-lg">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2A1B5D]">
                  Certificate Designer
                </h1>
                <p className="text-gray-500 text-xs">
                  Drag-and-drop template editor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Designer Name - Only Konva */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[#3834A8]/10 border border-[#3834A8]/20 rounded-xl">
                <Palette size={16} className="text-[#3834A8]" />
                <span className="text-sm font-semibold text-[#2A1B5D]">
                  Konva Designer
                </span>
              </div>

              {/* Save button - visible for all designers */}
              <button
                onClick={() => setShowSaveDialog(!showSaveDialog)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-lg hover:shadow-green-500/30 flex items-center gap-2 text-sm font-medium"
                title="Save Template"
              >
                <Save size={16} />
                <span>Save</span>
              </button>

              {/* Template Sidebar Toggle button */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="px-4 py-2 bg-[#3834A8] hover:bg-[#2A1B5D] text-white rounded-lg transition-all shadow-lg hover:shadow-[#3834A8]/30 flex items-center gap-2 text-sm font-medium"
                title={showSidebar ? "Hide Templates" : "Show Templates"}
              >
                <FolderOpen size={16} />
                <span>Templates ({savedTemplates.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Template Dialog */}
        {showSaveDialog && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 shadow-lg">
            <h3 className="text-lg font-semibold text-[#2A1B5D] mb-3 flex items-center gap-2">
              <Save size={20} className="text-green-500" />
              Save Template
            </h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-[#2A1B5D] placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSaveTemplate();
                  }}
                />
              </div>
              <button
                onClick={handleSaveTemplate}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Give your template a descriptive name to find it easily
              later
            </p>
          </div>
        )}

        {/* Templates Sidebar - Between Header and Editor */}
        <div
          className={`bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
            showSidebar
              ? "max-h-[400px] opacity-100"
              : "max-h-0 opacity-0 p-0 border-0 mb-0"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2A1B5D] flex items-center gap-2">
              <FolderOpen size={20} className="text-[#3834A8]" />
              Templates ({savedTemplates.length})
            </h3>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              title="Hide templates"
            >
              <ChevronUp size={18} className="text-gray-400" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[320px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {savedTemplates.length > 0 ? (
                savedTemplates.map((tmpl) => (
                  <div
                    key={tmpl.name}
                    className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:bg-white hover:border-[#3834A8]/50 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleLoadTemplate(tmpl)}
                  >
                    {/* Template Preview - Emphasize the design */}
                    <div className="relative aspect-[3/2] bg-white overflow-hidden">
                      {templateThumbnails[tmpl.name] ? (
                        <img
                          src={templateThumbnails[tmpl.name]}
                          alt={tmpl.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <FolderOpen size={32} className="text-gray-400" />
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-[#3834A8]/0 group-hover:bg-[#3834A8]/10 transition-colors flex items-center justify-center">
                        <span className="text-[#2A1B5D] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1 rounded-full">
                          Click to Load
                        </span>
                      </div>
                    </div>

                    {/* Template Name - Below preview, readable */}
                    <div className="p-3">
                      <p
                        className="text-[#2A1B5D] font-medium text-sm truncate"
                        title={tmpl.name}
                      >
                        {tmpl.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {tmpl.elements?.length || 0} elements
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(tmpl.name);
                          }}
                          className="p-1 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete template"
                        >
                          <X size={14} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <FolderOpen
                    size={48}
                    className="text-gray-300 mx-auto mb-3"
                  />
                  <p className="text-gray-500 mb-2 text-sm">
                    No saved templates yet
                  </p>
                  <p className="text-xs text-gray-400">
                    Design and save your first template
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area - Editor */}
        <div
          className={`relative overflow-hidden transition-all duration-300 ${
            showSidebar ? "h-[calc(100vh-540px)]" : "h-[calc(100vh-120px)]"
          }`}
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-lg h-full">
            <div className="h-full">
              <KonvaPdfDesigner
                template={loadedTemplate || template}
                onTemplateChange={handleTemplateChange}
              />
            </div>
          </div>
        </div>

        {/* PDF Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-[#2A1B5D] mb-1">
                    PDF Preview
                  </h2>
                  <p className="text-sm text-gray-500">
                    {previewData
                      ? `Certificate for ${
                          previewData.recipient?.name ||
                          previewData.recipient?.fullname ||
                          "recipient"
                        }`
                      : `${batchPreviews.length} certificate(s) ready`}
                  </p>
                </div>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              {/* PDF Preview Area */}
              <div className="flex-1 overflow-hidden p-4 min-h-0 bg-gray-50">
                {previewPdfUrl ? (
                  // Single PDF Preview - Full height
                  <iframe
                    src={previewPdfUrl}
                    className="w-full h-full rounded-lg border border-gray-200 bg-white"
                    title="PDF Preview"
                  />
                ) : batchPreviews.length > 0 ? (
                  // Batch Preview - Show list
                  <div className="h-full overflow-y-auto space-y-3">
                    <div className="bg-[#3834A8]/10 border border-[#3834A8]/20 rounded-xl p-4 mb-4">
                      <p className="text-[#3834A8] text-sm">
                        <strong>{batchPreviews.length} certificates</strong>{" "}
                        generated and ready to download
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {batchPreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#3834A8]/50 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#3834A8]/10 rounded-lg">
                              <FileText size={20} className="text-[#3834A8]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[#2A1B5D] font-medium truncate">
                                {preview.recipient?.name ||
                                  preview.recipient?.fullname ||
                                  "Recipient"}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {preview.filename}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                pdfGenerator.downloadPDF(
                                  preview.pdf,
                                  preview.filename,
                                );
                              }}
                              className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                            >
                              <Download size={16} className="text-green-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No preview available
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closePreview}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all text-sm font-medium"
                >
                  Close
                </button>
                <div className="flex gap-3">
                  {previewData && (
                    <button
                      onClick={downloadSinglePDF}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-lg text-sm font-medium"
                    >
                      <Download size={16} />
                      Download Certificate
                    </button>
                  )}
                  {batchPreviews.length > 0 && (
                    <button
                      onClick={downloadAllPDFs}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] hover:from-[#2A1B5D] hover:to-[#1a1040] text-white rounded-lg transition-all shadow-lg text-sm font-medium"
                    >
                      <Download size={16} />
                      Download All ({batchPreviews.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignerComparison;
