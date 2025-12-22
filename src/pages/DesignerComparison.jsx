import React, { useState, useCallback, useEffect } from "react";
import KonvaPdfDesigner from "../components/KonvaPdfDesigner";
import pdfGenerator from "../services/pdfGenerator";
import canvasPdfGenerator from "../services/canvasPdfGenerator";
import templateStorage from "../services/templateStorage";
import thumbnailGenerator from "../services/thumbnailGenerator";
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
  const [showSidebar, setShowSidebar] = useState(true); // Sidebar visibility
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
      alert("Error generating preview. Check console for details.");
    }
  };

  const handleDownloadPDF = () => {
    try {
      const pdf = pdfGenerator.generateSingleCertificate(template, csvData[0]);
      pdfGenerator.downloadPDF(pdf, "test-certificate.pdf");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Error downloading PDF. Check console for details.");
    }
  };

  const handleTemplateChange = useCallback(
    async (updatedTemplate) => {
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
              "🎨 Using canvas-based generation for pixel-perfect PDFs"
            );
            console.log("📦 Batch Info:", batchInfo);
            pdfs = await canvasPdfGenerator.generateBatch(
              updatedTemplate.fabricCanvas,
              updatedTemplate,
              csvRecords,
              batchInfo // Pass batch info for course/batch name
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
                mergedData
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
          alert("Error generating PDFs. Check console for details.");
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
            console.log(
              "🎨 Using canvas-based generation for pixel-perfect PDF"
            );
            pdf = await canvasPdfGenerator.generateFromCanvas(
              updatedTemplate.fabricCanvas,
              updatedTemplate,
              recipient
            );
          } else {
            // Fallback to element-based generation
            pdf = pdfGenerator.generateSingleCertificate(
              updatedTemplate,
              recipient
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
          alert("Error generating PDF. Check console for details.");
        }

        // Clear the flags
        delete updatedTemplate.generateSingle;
        delete updatedTemplate.currentRecipient;
      }
    },
    []
  );

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
      alert(`Successfully downloaded ${batchPreviews.length} certificate(s)!`);
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
      alert("Please enter a template name");
      setShowSaveDialog(true);
      return;
    }

    const templateToSave = {
      ...template,
      name: templateName,
    };

    const success = templateStorage.saveTemplate(templateToSave);
    if (success) {
      alert(`Template "${templateName}" saved successfully!`);
      setShowSaveDialog(false);
      loadSavedTemplates(); // Refresh the list
    } else {
      alert("Failed to save template");
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
        const thumbnail = await thumbnailGenerator.generateFromTemplate(tmpl, 600, 400);
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
      const thumbnail = await thumbnailGenerator.generateFromTemplate(templateToLoad, 600, 400);
      setTemplateThumbnails(prev => ({
        ...prev,
        [templateToLoad.name]: thumbnail
      }));
    } catch (error) {
      console.error(`Failed to regenerate thumbnail for ${templateToLoad.name}:`, error);
    }
  };

  const handleDeleteTemplate = (templateName) => {
    if (window.confirm(`Delete template "${templateName}"?`)) {
      const success = templateStorage.deleteTemplate(templateName);
      if (success) {
        loadSavedTemplates();
        alert("Template deleted!");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-[1920px] mx-auto">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Certificate Designer
                </h1>
                <p className="text-gray-400 text-xs">
                  Drag-and-drop template editor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Designer Name - Only Konva */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-xl">
                <Palette size={16} className="text-pink-400" />
                <span className="text-sm font-semibold text-white">Konva Designer</span>
              </div>

              {/* Save button - visible for all designers */}
              <button
                onClick={() => setShowSaveDialog(!showSaveDialog)}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all shadow-lg hover:shadow-green-500/20 flex items-center gap-2 text-sm"
                title="Save Template"
              >
                <Save size={16} />
                <span>Save</span>
              </button>

              {/* Template Sidebar Toggle button */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all shadow-lg hover:shadow-purple-500/20 flex items-center gap-2 text-sm"
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
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4 mb-4 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Save size={20} className="text-green-400" />
              Save Template
            </h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm text-gray-300 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                  className="w-full px-4 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
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
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Tip: Give your template a descriptive name to find it easily
              later
            </p>
          </div>
        )}

        {/* Main Content Area with Sidebar */}
        <div className="flex gap-4 h-[calc(100vh-120px)] relative">
          {/* Template Sidebar */}
          {showSidebar && (
            <div className="w-80 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FolderOpen size={20} className="text-purple-400" />
                  Templates ({savedTemplates.length})
                </h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                  title="Hide sidebar"
                >
                  <ChevronLeft size={18} className="text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {savedTemplates.length > 0 ? (
                  savedTemplates.map((tmpl) => (
                    <div
                      key={tmpl.name}
                      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer group"
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
                        <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-colors flex items-center justify-center">
                          <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to Load
                          </span>
                        </div>
                      </div>
                      
                      {/* Template Name - Below preview, readable */}
                      <div className="p-3">
                        <p className="text-white font-medium text-sm truncate" title={tmpl.name}>
                          {tmpl.name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400">
                            {tmpl.elements?.length || 0} elements
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(tmpl.name);
                            }}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete template"
                          >
                            <X size={14} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FolderOpen size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2 text-sm">No saved templates yet</p>
                    <p className="text-xs text-gray-500">
                      Design and save your first template
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sidebar Toggle Button (when hidden) */}
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all shadow-lg z-10"
              title="Show templates"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Designer Container - Full Screen */}
          <div className={`bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl transition-all ${showSidebar ? 'flex-1' : 'w-full'}`}>
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
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    PDF Preview
                  </h2>
                  <p className="text-sm text-gray-400">
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
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* PDF Preview Area */}
              <div className="flex-1 overflow-hidden p-4 min-h-0">
                {previewPdfUrl ? (
                  // Single PDF Preview - Full height
                  <iframe
                    src={previewPdfUrl}
                    className="w-full h-full rounded-lg border border-white/10 bg-gray-900"
                    title="PDF Preview"
                  />
                ) : batchPreviews.length > 0 ? (
                  // Batch Preview - Show list
                  <div className="h-full overflow-y-auto space-y-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                      <p className="text-blue-300 text-sm">
                        <strong>{batchPreviews.length} certificates</strong>{" "}
                        generated and ready to download
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {batchPreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <FileText size={20} className="text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">
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
                                  preview.filename
                                );
                              }}
                              className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                            >
                              <Download size={16} className="text-green-400" />
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
              <div className="flex items-center justify-between p-4 border-t border-white/10 bg-gray-800/50">
                <button
                  onClick={closePreview}
                  className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all text-sm"
                >
                  Close
                </button>
                <div className="flex gap-3">
                  {previewData && (
                    <button
                      onClick={downloadSinglePDF}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white rounded-lg transition-all shadow-lg text-sm"
                    >
                      <Download size={16} />
                      Download Certificate
                    </button>
                  )}
                  {batchPreviews.length > 0 && (
                    <button
                      onClick={downloadAllPDFs}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white rounded-lg transition-all shadow-lg text-sm"
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
