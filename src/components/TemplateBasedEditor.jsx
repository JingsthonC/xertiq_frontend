import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  X,
  Save,
  Download,
  Eye,
  Type,
  Settings,
  Wand2,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { parseTemplateFile } from "../utils/templateParser";
import {
  parseDataSourceFile,
  validateColumns,
} from "../utils/dataSourceParser";
import {
  detectDataFields,
  matchHeadersToFields,
  applySmartPositioning,
  autoDetectDynamicFields,
} from "../utils/smartPositioning";

const TemplateBasedEditor = ({
  onSave,
  onGenerate,
  onTemplateChange,
  onDataSourceChange,
}) => {
  const [templateFile, setTemplateFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);
  const [template, setTemplate] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Edit, 3: Preview
  const canvasRef = useRef(null);

  // Notify parent of changes
  useEffect(() => {
    if (onTemplateChange && template) {
      onTemplateChange(template);
    }
  }, [template, onTemplateChange]);

  useEffect(() => {
    if (onDataSourceChange && dataSource) {
      onDataSourceChange(dataSource);
    }
  }, [dataSource, onDataSourceChange]);

  const applySmartPositioningToTemplate = useCallback(
    (parsedData, currentTemplate) => {
      if (!currentTemplate || !parsedData) return currentTemplate;

      // Detect fields in template
      const templateFields = detectDataFields(currentTemplate.elements);
      const headerMapping = matchHeadersToFields(
        parsedData.headers,
        templateFields
      );

      // Apply smart positioning
      const updatedElements = applySmartPositioning(
        currentTemplate.elements,
        parsedData.headers,
        headerMapping
      );

      // Auto-detect dynamic fields
      const finalElements = autoDetectDynamicFields(
        updatedElements,
        parsedData.headers
      );

      return {
        ...currentTemplate,
        elements: finalElements,
      };
    },
    []
  );

  const handleTemplateUpload = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setTemplateFile(file);
    setIsLoading(true);
    setError(null);

    try {
      const parsedTemplate = await parseTemplateFile(file);
      setTemplate(parsedTemplate);
    } catch (err) {
      setError(`Template parsing failed: ${err.message}`);
      console.error("Template parsing error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDataUpload = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setDataFile(file);
      setIsLoading(true);
      setError(null);

      try {
        const parsedData = await parseDataSourceFile(file);
        setDataSource(parsedData);

        // If template is already loaded, apply smart positioning
        setTemplate((currentTemplate) => {
          if (currentTemplate) {
            const updated = applySmartPositioningToTemplate(
              parsedData,
              currentTemplate
            );
            setStep(2); // Move to edit step
            return updated;
          }
          return currentTemplate;
        });
      } catch (err) {
        setError(`Data parsing failed: ${err.message}`);
        console.error("Data parsing error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [applySmartPositioningToTemplate]
  );

  // Template file dropzone
  const {
    getRootProps: getTemplateRootProps,
    getInputProps: getTemplateInputProps,
    isDragActive: isTemplateDragActive,
  } = useDropzone({
    onDrop: handleTemplateUpload,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    multiple: false,
  });

  // Data file dropzone
  const {
    getRootProps: getDataRootProps,
    getInputProps: getDataInputProps,
    isDragActive: isDataDragActive,
  } = useDropzone({
    onDrop: handleDataUpload,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  const handleProceedToEditor = () => {
    if (template && dataSource) {
      const updated = applySmartPositioningToTemplate(dataSource, template);
      setTemplate(updated);
      setStep(2);
    }
  };

  const updateElement = (elementId, updates) => {
    setTemplate({
      ...template,
      elements: template.elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
    });
  };

  const addTextElement = () => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: "text",
      text: "New Text",
      x: 50,
      y: 50,
      width: 150,
      height: 20,
      fontSize: 12,
      font: "helvetica",
      color: "#000000",
      align: "left",
      isDynamic: false,
      dataField: null,
    };

    setTemplate({
      ...template,
      elements: [...template.elements, newElement],
    });
    setSelectedElement(newElement.id);
  };

  const removeElement = (elementId) => {
    setTemplate({
      ...template,
      elements: template.elements.filter((el) => el.id !== elementId),
    });
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  const getCanvasDimensions = () => {
    if (!template) return { width: 210, height: 297 };
    const isLandscape = template.orientation === "landscape";
    return {
      width: isLandscape ? 297 : 210,
      height: isLandscape ? 210 : 297,
      scale: 2,
    };
  };

  const dims = getCanvasDimensions();

  // Render upload step
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Wand2 className="text-purple-400" size={24} />
            Smart Template Editor
          </h3>
          <p className="text-gray-400 mb-6">
            Upload a template file (PDF, Word, or Image) and a data source (CSV
            or Excel) to automatically position fields and customize your
            certificate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Template Upload */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <FileText className="text-blue-400" size={18} />
                Template File
              </h4>
              <div
                {...getTemplateRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isTemplateDragActive
                    ? "border-blue-400 bg-blue-500/10"
                    : "border-white/20 hover:border-white/40 bg-white/5"
                }`}
              >
                <input {...getTemplateInputProps()} />
                {templateFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="text-green-400 mx-auto" size={32} />
                    <p className="text-white font-medium">
                      {templateFile.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {template
                        ? `${template.elements.length} elements detected`
                        : "Processing..."}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTemplateFile(null);
                        setTemplate(null);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto mb-3 text-blue-400" size={32} />
                    <p className="text-white mb-2">Upload Template</p>
                    <p className="text-sm text-gray-400">
                      PDF, Word, or Image files
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Data Source Upload */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <FileSpreadsheet className="text-green-400" size={18} />
                Data Source
              </h4>
              <div
                {...getDataRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDataDragActive
                    ? "border-green-400 bg-green-500/10"
                    : "border-white/20 hover:border-white/40 bg-white/5"
                }`}
              >
                <input {...getDataInputProps()} />
                {dataFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="text-green-400 mx-auto" size={32} />
                    <p className="text-white font-medium">{dataFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {dataSource
                        ? `${dataSource.totalRows} rows, ${dataSource.headers.length} columns`
                        : "Processing..."}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDataFile(null);
                        setDataSource(null);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <FileSpreadsheet
                      className="mx-auto mb-3 text-green-400"
                      size={32}
                    />
                    <p className="text-white mb-2">Upload Data</p>
                    <p className="text-sm text-gray-400">CSV or Excel files</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Data Preview */}
          {dataSource && (
            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3">Data Headers</h4>
              <div className="flex flex-wrap gap-2">
                {dataSource.headers.map((header, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm"
                  >
                    {header}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-3">
                {dataSource.totalRows} rows of data ready
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-400/40 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-400" size={20} />
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Proceed Button */}
          {template && dataSource && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleProceedToEditor}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Wand2 size={18} />
                Open Editor with Smart Positioning
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-blue-400">
              <Loader className="animate-spin" size={20} />
              <span>Processing files...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render editor step
  if (step === 2 && template) {
    const selectedEl = template.elements.find(
      (el) => el.id === selectedElement
    );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Template Editor
            </h3>
            <p className="text-gray-400">
              Customize your template. Fields from data source are automatically
              positioned.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (onSave) onSave(template);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Template Canvas</h4>
                <div className="flex gap-2">
                  <button
                    onClick={addTextElement}
                    className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Type size={14} />
                    Add Text
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Settings size={14} />
                    Settings
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div
                ref={canvasRef}
                className="relative bg-white rounded-lg shadow-lg"
                style={{
                  width: `${dims.width * dims.scale}px`,
                  height: `${dims.height * dims.scale}px`,
                  margin: "0 auto",
                }}
              >
                {/* Background Image */}
                {template.backgroundImage && (
                  <img
                    src={template.backgroundImage}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    style={{ opacity: 0.3 }}
                  />
                )}

                {/* Elements */}
                {template.elements.map((element) => {
                  const isSelected = selectedElement === element.id;
                  const scale = dims.scale;

                  if (element.type === "text") {
                    return (
                      <div
                        key={element.id}
                        onClick={() => setSelectedElement(element.id)}
                        className={`absolute cursor-pointer transition-all ${
                          isSelected
                            ? "ring-2 ring-blue-500 ring-offset-2"
                            : "hover:ring-1 hover:ring-blue-300"
                        }`}
                        style={{
                          left: `${element.x * scale}px`,
                          top: `${element.y * scale}px`,
                          width: `${element.width * scale}px`,
                          minHeight: `${element.height * scale}px`,
                          fontSize: `${element.fontSize * scale}px`,
                          fontFamily: element.font || "helvetica",
                          color: element.color,
                          textAlign: element.align,
                          fontWeight: element.fontStyle?.includes("bold")
                            ? "bold"
                            : "normal",
                          fontStyle: element.fontStyle?.includes("italic")
                            ? "italic"
                            : "normal",
                          backgroundColor: isSelected
                            ? "rgba(59, 130, 246, 0.1)"
                            : "transparent",
                          padding: isSelected ? "2px" : "0",
                        }}
                      >
                        {element.isDynamic ? (
                          <span className="text-blue-600 font-semibold">
                            {`{{${element.dataField || "field"}}}`}
                          </span>
                        ) : (
                          element.text
                        )}
                        {element.isDynamic && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({element.dataField})
                          </span>
                        )}
                      </div>
                    );
                  } else if (element.type === "image") {
                    return (
                      <img
                        key={element.id}
                        src={element.image}
                        alt="Element"
                        onClick={() => setSelectedElement(element.id)}
                        className={`absolute cursor-pointer ${
                          isSelected ? "ring-2 ring-blue-500" : ""
                        }`}
                        style={{
                          left: `${element.x * scale}px`,
                          top: `${element.y * scale}px`,
                          width: `${element.width * scale}px`,
                          height: `${element.height * scale}px`,
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <h4 className="text-white font-medium">Properties</h4>

              {selectedEl ? (
                <div className="space-y-4">
                  {/* Text Content */}
                  {selectedEl.type === "text" && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">
                          Text Content
                        </label>
                        <input
                          type="text"
                          value={selectedEl.text}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              text: e.target.value,
                            })
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>

                      {/* Make Dynamic */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isDynamic"
                          checked={selectedEl.isDynamic || false}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              isDynamic: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <label
                          htmlFor="isDynamic"
                          className="text-sm text-gray-300"
                        >
                          Use data field
                        </label>
                      </div>

                      {/* Data Field Selection */}
                      {selectedEl.isDynamic && dataSource && (
                        <div>
                          <label className="text-sm text-gray-400 block mb-1">
                            Data Field
                          </label>
                          <select
                            value={selectedEl.dataField || ""}
                            onChange={(e) =>
                              updateElement(selectedEl.id, {
                                dataField: e.target.value,
                                text: `{{${e.target.value}}}`,
                              })
                            }
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            <option value="">Select field</option>
                            {dataSource.headers.map((header) => (
                              <option key={header} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Position */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm text-gray-400 block mb-1">
                            X (mm)
                          </label>
                          <input
                            type="number"
                            value={Math.round(selectedEl.x)}
                            onChange={(e) =>
                              updateElement(selectedEl.id, {
                                x: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400 block mb-1">
                            Y (mm)
                          </label>
                          <input
                            type="number"
                            value={Math.round(selectedEl.y)}
                            onChange={(e) =>
                              updateElement(selectedEl.id, {
                                y: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>

                      {/* Font Size */}
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">
                          Font Size
                        </label>
                        <input
                          type="number"
                          value={selectedEl.fontSize || 12}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              fontSize: parseFloat(e.target.value) || 12,
                            })
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                          min="8"
                          max="72"
                        />
                      </div>

                      {/* Color */}
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">
                          Color
                        </label>
                        <input
                          type="color"
                          value={selectedEl.color || "#000000"}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              color: e.target.value,
                            })
                          }
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Alignment */}
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">
                          Alignment
                        </label>
                        <select
                          value={selectedEl.align || "left"}
                          onChange={(e) =>
                            updateElement(selectedEl.id, {
                              align: e.target.value,
                            })
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => removeElement(selectedEl.id)}
                    className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
                  >
                    Delete Element
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">
                  Select an element to edit
                </p>
              )}

              {/* Available Data Fields */}
              {dataSource && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h5 className="text-sm text-gray-400 mb-2">
                    Available Data Fields
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {dataSource.headers.map((header) => (
                      <button
                        key={header}
                        onClick={() => {
                          addTextElement();
                          setTimeout(() => {
                            const newEl =
                              template.elements[template.elements.length - 1];
                            if (newEl) {
                              updateElement(newEl.id, {
                                isDynamic: true,
                                dataField: header,
                                text: `{{${header}}}`,
                              });
                              setSelectedElement(newEl.id);
                            }
                          }, 100);
                        }}
                        className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs"
                      >
                        {header}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TemplateBasedEditor;




