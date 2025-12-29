import React, { useState, useEffect } from "react";
import showToast from "../utils/toast";
import {
  Download,
  Eye,
  Save,
  Upload,
  FolderOpen,
  Trash2,
  FileDown,
  Zap,
} from "lucide-react";
import Header from "../components/Header";
import ExtensionHeader from "../components/ExtensionHeader";
import NavigationHeader from "../components/NavigationHeader";
import PDFTemplateDesigner from "../components/PDFTemplateDesigner";
import CSVUploader from "../components/CSVUploader";
import pdfGenerator from "../services/pdfGenerator";
import templateStorage from "../services/templateStorage";
import apiService from "../services/api";
import thumbnailGenerator from "../services/thumbnailGenerator";
import useWalletStore from "../store/wallet";

// Detect if running as Chrome extension
const isExtension = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.chrome !== "undefined" &&
    window.chrome.runtime &&
    window.chrome.runtime.id
  );
};

const CertificateGenerator = () => {
  const isExt = isExtension();
  const { user } = useWalletStore();

  const [template, setTemplate] = useState(pdfGenerator.getDefaultTemplate());
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [publicTemplates, setPublicTemplates] = useState([]);
  const [myTemplates, setMyTemplates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("template"); // template, data, generate
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showPublicLibrary, setShowPublicLibrary] = useState(false);
  const [showMyTemplates, setShowMyTemplates] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [templateVisibility, setTemplateVisibility] = useState("private"); // private or public

  useEffect(() => {
    loadSavedTemplates();
    loadPublicTemplates();
    if (user) {
      loadMyTemplates();
    }
  }, [user]);

  const loadSavedTemplates = () => {
    const templates = templateStorage.getAllTemplates();
    setSavedTemplates(templates);
  };

  const loadPublicTemplates = async () => {
    try {
      const templates = await apiService.getPublicTemplates();
      setPublicTemplates(templates);
    } catch (error) {
      console.error("Error loading public templates:", error);
    }
  };

  const loadMyTemplates = async () => {
    try {
      const templates = await apiService.getMyTemplates();
      setMyTemplates(templates);
    } catch (error) {
      console.error("Error loading my templates:", error);
    }
  };

  const handleTemplateChange = (newTemplate) => {
    setTemplate(newTemplate);
  };

  const handleCSVDataLoaded = (data, headers) => {
    setCsvData(data);
    setCsvHeaders(headers);
  };

  const handleSaveTemplate = () => {
    if (!template.name) {
      showToast.warning("Please enter a template name in settings");
      return;
    }

    const success = templateStorage.saveTemplate(template);
    if (success) {
      showToast.success("Template saved locally!");
      loadSavedTemplates();
    } else {
      showToast.error("Failed to save template");
    }
  };

  const handleSaveTemplateToPlatform = async () => {
    if (!template.name) {
      showToast.warning("Please enter a template name in settings");
      return;
    }

    if (!user) {
      showToast.warning("Please login to save templates to the platform");
      return;
    }

    setIsSaving(true);
    try {
      // Generate a preview thumbnail (we'll implement this later)
      const thumbnailDataUrl = await generateThumbnail();

      const templateData = {
        name: template.name,
        description: template.description || "",
        templateData: template,
        thumbnail: thumbnailDataUrl,
        isPublic: templateVisibility === "public",
        category: template.category || "certificate",
      };

      await apiService.saveTemplateToBackend(templateData);
      showToast.success("Template saved to platform successfully!");
      loadMyTemplates();
    } catch (error) {
      console.error("Error saving template to platform:", error);
      showToast.error(
        "Failed to save template to platform: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTemplateFromPlatform = async (templateId) => {
    try {
      const templateData = await apiService.getTemplateById(templateId);
      setTemplate(templateData.templateData);
      setShowPublicLibrary(false);
      setShowMyTemplates(false);
      showToast.success("Template loaded successfully!");
    } catch (error) {
      console.error("Error loading template:", error);
      showToast.error("Failed to load template");
    }
  };

  const handleUpdateTemplateWithFile = async (templateId, file) => {
    if (!file) {
      showToast.warning("Please select a file to upload");
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      showToast.error("Invalid file type. Please upload PDF, PNG, JPG, or Word (.docx) files only.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast.error("File size too large. Maximum size is 10MB.");
      return;
    }

    setIsSaving(true);
    try {
      // Get current template data
      const currentTemplate = template;
      
      // Update template with file
      await apiService.updateTemplate(templateId, currentTemplate, file);
      showToast.success("Template updated successfully with file!");
      loadMyTemplates();
    } catch (error) {
      console.error("Error updating template:", error);
      showToast.error("Failed to update template: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplateFromPlatform = async (templateId) => {
    if (!window.confirm("Delete this template from the platform?")) {
      return;
    }

    try {
      await apiService.deleteTemplateFromBackend(templateId);
      showToast.success("Template deleted successfully!");
      loadMyTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      showToast.error("Failed to delete template");
    }
  };

  const handleToggleVisibility = async (templateId, currentVisibility) => {
    try {
      await apiService.toggleTemplateVisibility(templateId, !currentVisibility);
      showToast.success(`Template is now ${!currentVisibility ? "public" : "private"}`);
      loadMyTemplates();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      showToast.error("Failed to update visibility");
    }
  };

  const generateThumbnail = async () => {
    try {
      // Generate thumbnail from the current template
      const thumbnailDataUrl = await thumbnailGenerator.generateFromTemplate(
        template,
        400,
        300
      );
      return thumbnailDataUrl;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return ""; // Return empty string on error
    }
  };

  const handleLoadTemplate = (templateName) => {
    const loadedTemplate = templateStorage.getTemplate(templateName);
    if (loadedTemplate) {
      setTemplate(loadedTemplate);
      setShowTemplateLibrary(false);
    }
  };

  const handleDeleteTemplate = (templateName) => {
    if (window.confirm(`Delete template "${templateName}"?`)) {
      const success = templateStorage.deleteTemplate(templateName);
      if (success) {
        loadSavedTemplates();
      }
    }
  };

  const handleExportTemplate = () => {
    templateStorage.exportTemplate(template);
  };

  const handleImportTemplate = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const importedTemplate = await templateStorage.importTemplate(file);
        setTemplate(importedTemplate);
        showToast.success("Template imported successfully!");
      } catch (error) {
        showToast.error("Failed to import template: " + error.message);
      }
    }
  };

  const handleGeneratePreview = () => {
    if (csvData.length === 0) {
      showToast.warning("Please upload CSV data first");
      return;
    }

    const sampleData = csvData[0];
    const previewDataUrl = pdfGenerator.generatePreview(template, sampleData);
    setPreviewUrl(previewDataUrl);
  };

  const handleGeneratePDFs = async (separateFiles = false) => {
    if (csvData.length === 0) {
      showToast.warning("Please upload CSV data first");
      return;
    }

    setIsGenerating(true);

    try {
      if (separateFiles) {
        const pdfs = pdfGenerator.generateBatchCertificates(
          template,
          csvData,
          true
        );
        pdfGenerator.downloadBatchPDFs(
          pdfs,
          csvData,
          `certificate_{{name}}_{{index}}.pdf`
        );
      } else {
        const pdf = pdfGenerator.generateBatchCertificates(
          template,
          csvData,
          false
        );
        pdfGenerator.downloadPDF(pdf, `certificates_batch_${Date.now()}.pdf`);
      }

      showToast.success(`Successfully generated ${csvData.length} certificate(s)!`);
    } catch (error) {
      console.error("Error generating PDFs:", error);
      showToast.error("Failed to generate PDFs. Please check your template and data.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "template":
        return (
          <PDFTemplateDesigner
            template={template}
            onTemplateChange={handleTemplateChange}
            availableFields={csvHeaders}
          />
        );

      case "data":
        return <CSVUploader onDataLoaded={handleCSVDataLoaded} />;

      case "generate":
        return (
          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Preview</h3>
                <button
                  onClick={handleGeneratePreview}
                  disabled={csvData.length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye size={16} />
                  <span className="text-sm">Generate Preview</span>
                </button>
              </div>

              {previewUrl ? (
                <div className="bg-white rounded-lg p-2">
                  <iframe
                    src={previewUrl}
                    className="w-full h-[400px] rounded"
                    title="Certificate Preview"
                  />
                </div>
              ) : (
                <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-xl h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <Eye size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Click "Generate Preview" to see your certificate
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Generation Options */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Generate PDFs
              </h3>

              {csvData.length > 0 ? (
                <div className="space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-sm text-blue-400">
                      Ready to generate {csvData.length} certificate(s)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleGeneratePDFs(false)}
                      disabled={isGenerating}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={18} />
                      <span className="text-sm font-medium">
                        {isGenerating ? "Generating..." : "Single PDF"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleGeneratePDFs(true)}
                      disabled={isGenerating}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileDown size={18} />
                      <span className="text-sm font-medium">
                        {isGenerating ? "Generating..." : "Separate Files"}
                      </span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    Single PDF combines all certificates. Separate files creates
                    individual PDFs.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No data uploaded</p>
                  <button
                    onClick={() => setActiveTab("data")}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Upload CSV data →
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isExt) {
    return (
      <div className="h-full bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23] text-white overflow-hidden flex flex-col">
        <ExtensionHeader />
        <NavigationHeader title="PDF Generator" showBack={true} />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Tabs */}
          <div className="flex space-x-2 bg-white/5 rounded-lg p-1">
            {[
              { id: "template", label: "Template" },
              { id: "data", label: "Data" },
              { id: "generate", label: "Generate" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleSaveTemplate}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm"
            >
              <Save size={14} />
              <span>Save</span>
            </button>
            <button
              onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors text-sm"
            >
              <FolderOpen size={14} />
              <span>Library</span>
            </button>
          </div>

          {/* Template Library */}
          {showTemplateLibrary && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <h4 className="text-sm font-semibold text-white mb-2">
                Saved Templates ({savedTemplates.length})
              </h4>
              {savedTemplates.length > 0 ? (
                <div className="space-y-2">
                  {savedTemplates.map((tmpl) => (
                    <div
                      key={tmpl.name}
                      className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                    >
                      <button
                        onClick={() => handleLoadTemplate(tmpl.name)}
                        className="text-sm text-white hover:text-blue-400 truncate flex-1 text-left"
                      >
                        {tmpl.name}
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(tmpl.name)}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">
                  No saved templates
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23]">
      <Header />
      <NavigationHeader title="Certificate PDF Generator" showBack={true} />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Certificate PDF Generator
            </h1>
            <p className="text-gray-300">
              Design certificate templates, upload CSV data, and generate PDFs
            </p>
          </div>

          {/* Action Bar */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveTemplate}
                className="flex items-center space-x-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-colors"
              >
                <Save size={18} />
                <span>Save Template</span>
              </button>

              <button
                onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-colors"
              >
                <FolderOpen size={18} />
                <span>Template Library</span>
              </button>

              <button
                onClick={handleExportTemplate}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors"
              >
                <Download size={18} />
                <span>Export</span>
              </button>

              <label className="flex items-center space-x-2 px-6 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl transition-colors cursor-pointer">
                <Upload size={18} />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportTemplate}
                  className="hidden"
                />
              </label>

              {/* Platform Templates */}
              {user && (
                <>
                  <button
                    onClick={handleSaveTemplateToPlatform}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-400 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Upload size={18} />
                    <span>{isSaving ? "Saving..." : "Save to Platform"}</span>
                  </button>

                  <button
                    onClick={() => setShowMyTemplates(!showMyTemplates)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 rounded-xl transition-colors"
                  >
                    <FolderOpen size={18} />
                    <span>My Templates</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setShowPublicLibrary(!showPublicLibrary)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-400 rounded-xl transition-colors"
              >
                <FolderOpen size={18} />
                <span>Public Templates</span>
              </button>
            </div>

            {/* Visibility Toggle for Platform Save */}
            {user && (
              <div className="mt-4 flex items-center space-x-4 px-2">
                <label className="text-sm text-gray-400">
                  Template Visibility:
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTemplateVisibility("private")}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      templateVisibility === "private"
                        ? "bg-blue-500 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    Private
                  </button>
                  <button
                    onClick={() => setTemplateVisibility("public")}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      templateVisibility === "public"
                        ? "bg-green-500 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    Public (Share with everyone)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Template Library */}
          {showTemplateLibrary && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                Local Template Library ({savedTemplates.length})
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Templates saved in your browser (local storage)
              </p>
              {savedTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedTemplates.map((tmpl) => (
                    <div
                      key={tmpl.name}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">
                            {tmpl.name}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {tmpl.elements?.length || 0} elements
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteTemplate(tmpl.name)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleLoadTemplate(tmpl.name)}
                        className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm"
                      >
                        Load Template
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No saved templates. Design and save your first template!
                </p>
              )}
            </div>
          )}

          {/* Public Templates Library */}
          {showPublicLibrary && (
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Zap className="text-yellow-400" size={24} />
                Public Templates ({publicTemplates.length})
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Community-shared templates you can use
              </p>
              {publicTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicTemplates.map((tmpl) => (
                    <div
                      key={tmpl.id || tmpl._id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                    >
                      {tmpl.thumbnail && (
                        <div className="mb-3 rounded-lg overflow-hidden bg-white/5 h-32">
                          <img
                            src={tmpl.thumbnail}
                            alt={tmpl.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h4 className="text-white font-medium mb-1">
                        {tmpl.name}
                      </h4>
                      <p className="text-xs text-gray-400 mb-2">
                        {tmpl.description || "No description"}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        By: {tmpl.createdBy?.name || "Anonymous"}
                      </p>
                      <button
                        onClick={() => handleLoadTemplateFromPlatform(tmpl.id || tmpl._id)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-400 rounded-lg transition-colors text-sm"
                      >
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No public templates available yet. Be the first to share!
                </p>
              )}
            </div>
          )}

          {/* My Templates (Platform) */}
          {user && showMyTemplates && (
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <FolderOpen className="text-purple-400" size={24} />
                My Platform Templates ({myTemplates.length})
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Your templates saved on the XertiQ platform
              </p>
              {myTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myTemplates.map((tmpl) => (
                    <div
                      key={tmpl.id || tmpl._id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                    >
                      {tmpl.thumbnail && (
                        <div className="mb-3 rounded-lg overflow-hidden bg-white/5 h-32">
                          <img
                            src={tmpl.thumbnail}
                            alt={tmpl.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">
                            {tmpl.name}
                          </h4>
                          <p className="text-xs text-gray-400 mb-2">
                            {tmpl.description || "No description"}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                tmpl.isPublic
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {tmpl.isPublic ? "Public" : "Private"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteTemplateFromPlatform(tmpl.id || tmpl._id)
                          }
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            handleLoadTemplateFromPlatform(tmpl.id || tmpl._id)
                          }
                          className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors text-sm"
                        >
                          Load Template
                        </button>
                        <label className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm cursor-pointer text-center block">
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUpdateTemplateWithFile(tmpl.id || tmpl._id, file);
                              }
                              // Reset input
                              e.target.value = '';
                            }}
                            className="hidden"
                            disabled={isSaving}
                          />
                          {isSaving ? "Uploading..." : "Update with File"}
                        </label>
                        <button
                          onClick={() =>
                            handleToggleVisibility(tmpl.id || tmpl._id, tmpl.isPublic)
                          }
                          className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm"
                        >
                          Make {tmpl.isPublic ? "Private" : "Public"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No templates saved to platform yet. Click "Save to Platform"
                  to share your templates!
                </p>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tabs Navigation */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2 inline-flex space-x-2">
                {[
                  { id: "template", label: "Design Template", icon: Zap },
                  { id: "data", label: "Upload Data", icon: Upload },
                  { id: "generate", label: "Generate PDFs", icon: Download },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
