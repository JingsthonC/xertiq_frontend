import React, { useState, useRef, useEffect } from "react";
import {
  Type,
  Image as ImageIcon,
  Trash2,
  Upload,
  Settings,
  Square,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Grid,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const PDFTemplateDesigner = ({
  template,
  onTemplateChange,
  availableFields = [],
}) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(0.8); // Increased from 0.5 for larger editing area
  const [zoomInputValue, setZoomInputValue] = useState(""); // For editable zoom input
  const [isEditingZoom, setIsEditingZoom] = useState(false); // Track if zoom input is being edited
  const canvasRef = useRef(null);

  // Get canvas dimensions based on template orientation
  const getCanvasDimensions = () => {
    const isLandscape = template.orientation === "landscape";
    // A4 in mm: 297x210 landscape, 210x297 portrait
    // Scale to pixels (1mm ≈ 3.779px at 96 DPI, but we'll use simpler ratio)
    const baseWidth = isLandscape ? 297 : 210;
    const baseHeight = isLandscape ? 210 : 297;

    return {
      width: baseWidth * 2 * zoom, // Scale for display
      height: baseHeight * 2 * zoom,
      actualWidth: baseWidth,
      actualHeight: baseHeight,
    };
  };

  const dims = getCanvasDimensions();

  const addTextElement = () => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: "text",
      text: "Double click to edit",
      isDynamic: false, // NEW: Mark as fixed or dynamic
      dataField: null, // NEW: CSV field for dynamic elements
      x: 50,
      y: 50,
      width: 200,
      height: 30,
      fontSize: 16,
      font: "helvetica",
      fontStyle: "normal",
      color: "#000000",
      align: "left",
    };

    onTemplateChange({
      ...template,
      elements: [...(template.elements || []), newElement],
    });
    setSelectedElement(newElement.id);
  };

  const addShape = (shapeType) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: shapeType, // 'rectangle' or 'line'
      x: 50,
      y: 50,
      width: shapeType === "line" ? 200 : 150,
      height: shapeType === "line" ? 2 : 100,
      color: "#000000",
      filled: shapeType !== "line",
      borderWidth: 2,
    };

    onTemplateChange({
      ...template,
      elements: [...(template.elements || []), newElement],
    });
    setSelectedElement(newElement.id);
  };

  const removeElement = (elementId) => {
    onTemplateChange({
      ...template,
      elements: template.elements.filter((el) => el.id !== elementId),
    });
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  const updateElement = (elementId, updates) => {
    onTemplateChange({
      ...template,
      elements: template.elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
    });
  };

  const updateTemplateSettings = (updates) => {
    onTemplateChange({
      ...template,
      ...updates,
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newElement = {
          id: `element-${Date.now()}`,
          type: "image",
          image: event.target.result,
          x: 20,
          y: 20,
          width: 60,
          height: 60,
        };
        onTemplateChange({
          ...template,
          elements: [...(template.elements || []), newElement],
        });
        setSelectedElement(newElement.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onTemplateChange({
          ...template,
          backgroundImage: event.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag handlers
  const handleMouseDown = (e, element) => {
    if (e.target.classList.contains("resize-handle")) return;

    setDraggingElement(element.id);
    setSelectedElement(element.id);

    const scaleX = dims.actualWidth / dims.width;
    const scaleY = dims.actualHeight / dims.height;

    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      elementX: element.x,
      elementY: element.y,
      scaleX,
      scaleY,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingElement || !dragStart) return;

    const deltaX = (e.clientX - dragStart.mouseX) * dragStart.scaleX;
    const deltaY = (e.clientY - dragStart.mouseY) * dragStart.scaleY;

    const newX = Math.max(
      0,
      Math.min(dims.actualWidth - 20, dragStart.elementX + deltaX)
    );
    const newY = Math.max(
      0,
      Math.min(dims.actualHeight - 20, dragStart.elementY + deltaY)
    );

    updateElement(draggingElement, {
      x: Math.round(newX),
      y: Math.round(newY),
    });
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
    setDragStart(null);
  };

  const handleDoubleClick = (element) => {
    if (element.type === "text") {
      const newText = prompt(
        "Enter text (use {{fieldName}} for dynamic fields):",
        element.text
      );
      if (newText !== null) {
        updateElement(element.id, { text: newText });
      }
    }
  };

  const selectedElementData = template.elements?.find(
    (el) => el.id === selectedElement
  );

  const handleCanvasClick = (e) => {
    if (
      e.target === canvasRef.current ||
      e.target.classList.contains("canvas-bg")
    ) {
      setSelectedElement(null);
    }
  };

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if not typing in an input/textarea
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + Plus/Equal - Zoom In
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setZoom((prev) => Math.min(1.5, prev + 0.1));
        return;
      }

      // Ctrl/Cmd + Minus - Zoom Out
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoom((prev) => Math.max(0.3, prev - 0.1));
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Zoom input handlers
  const handleZoomInputChange = (e) => {
    setZoomInputValue(e.target.value);
  };

  const handleZoomInputBlur = () => {
    setIsEditingZoom(false);
    const numValue = parseFloat(zoomInputValue);
    if (!isNaN(numValue) && numValue > 0) {
      const percentage = Math.max(30, Math.min(150, numValue));
      setZoom(percentage / 100);
    }
    setZoomInputValue("");
  };

  const handleZoomInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    } else if (e.key === "Escape") {
      setZoomInputValue("");
      setIsEditingZoom(false);
      e.target.blur();
    }
  };

  const handleZoomInputFocus = () => {
    setIsEditingZoom(true);
    setZoomInputValue(Math.round(zoom * 100).toString());
  };

  // Reset zoom input when not editing and zoom changes externally
  useEffect(() => {
    if (!isEditingZoom) {
      setZoomInputValue("");
    }
  }, [zoom, isEditingZoom]);

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white">
              Visual Designer
            </h3>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${
                showGrid
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-400 hover:bg-white/10"
              }`}
              title="Toggle Grid"
            >
              <Grid size={16} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
              className="p-2 text-gray-400 hover:bg-white/10 rounded-lg transition-colors"
              title="Zoom Out (Ctrl/Cmd + -)"
            >
              <ZoomOut size={16} />
            </button>
            {isEditingZoom ? (
              <input
                type="text"
                value={zoomInputValue}
                onChange={handleZoomInputChange}
                onBlur={handleZoomInputBlur}
                onKeyDown={handleZoomInputKeyDown}
                onFocus={handleZoomInputFocus}
                className="w-16 px-2 py-1 bg-white/5 border border-white/20 rounded-lg text-xs text-white text-center focus:outline-none focus:border-blue-500"
                autoFocus
              />
            ) : (
              <span
                onClick={handleZoomInputFocus}
                className="text-xs text-gray-400 w-12 text-center cursor-text hover:bg-white/10 rounded px-1 py-1"
                title="Click to edit zoom percentage"
              >
                {Math.round(zoom * 100)}%
              </span>
            )}
            <button
              onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
              className="p-2 text-gray-400 hover:bg-white/10 rounded-lg transition-colors"
              title="Zoom In (Ctrl/Cmd + +)"
            >
              <ZoomIn size={16} />
            </button>

            <div className="w-px h-6 bg-white/10 mx-2"></div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-400 hover:bg-white/10"
              }`}
              title="Template Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Tool Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={addTextElement}
            className="flex items-center space-x-2 px-3 py-2 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-secondary rounded-lg transition-colors text-sm"
            title="Add Text"
          >
            <Type size={14} />
            <span>Text</span>
          </button>

          <label className="flex items-center space-x-2 px-3 py-2 bg-brand-primaryDark/20 hover:bg-brand-primaryDark/30 text-brand-secondary rounded-lg transition-colors cursor-pointer text-sm">
            <ImageIcon size={14} />
            <span>Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => addShape("rectangle")}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm"
            title="Add Rectangle"
          >
            <Square size={14} />
            <span>Box</span>
          </button>

          <button
            onClick={() => addShape("line")}
            className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors text-sm"
            title="Add Line"
          >
            <Minus size={14} />
            <span>Line</span>
          </button>

          <label className="flex items-center space-x-2 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors cursor-pointer text-sm">
            <Upload size={14} />
            <span>Background</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Template Settings */}
      {showSettings && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-white">
            Template Settings
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={template.name || ""}
                onChange={(e) =>
                  updateTemplateSettings({ name: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="My Certificate"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Orientation
              </label>
              <select
                value={template.orientation || "landscape"}
                onChange={(e) =>
                  updateTemplateSettings({ orientation: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Paper Size
              </label>
              <select
                value={template.format || "a4"}
                onChange={(e) =>
                  updateTemplateSettings({ format: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Background
              </label>
              <input
                type="color"
                value={template.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  updateTemplateSettings({ backgroundColor: e.target.value })
                }
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!template.border}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateTemplateSettings({
                      border: { width: 2, color: "#4A70A9", margin: 15 },
                    });
                  } else {
                    updateTemplateSettings({ border: null });
                  }
                }}
                className="rounded"
              />
              <span className="text-xs text-gray-400">Add Border</span>
            </label>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl p-4">
          <div
            className="overflow-auto"
            onWheel={(e) => {
              // Zoom with Ctrl/Cmd + wheel
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setZoom((prev) => {
                  const newZoom = prev + delta;
                  return Math.max(0.3, Math.min(1.5, newZoom));
                });
              }
            }}
          >
            <div
              ref={canvasRef}
              className="canvas-bg relative mx-auto cursor-crosshair shadow-2xl"
              style={{
                width: dims.width,
                height: dims.height,
                backgroundColor: template.backgroundColor || "#ffffff",
                backgroundImage: showGrid
                  ? `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`
                  : "none",
                backgroundSize: showGrid ? "20px 20px" : "auto",
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleCanvasClick}
            >
              {/* Background Image */}
              {template.backgroundImage && (
                <img
                  src={template.backgroundImage}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                />
              )}

              {/* Render Elements */}
              {template.elements?.map((element) => {
                const scaleX = dims.width / dims.actualWidth;
                const scaleY = dims.height / dims.actualHeight;
                const displayX = element.x * scaleX;
                const displayY = element.y * scaleY;
                const displayWidth = (element.width || 100) * scaleX;
                const displayHeight = (element.height || 30) * scaleY;
                const isSelected = selectedElement === element.id;

                if (element.type === "text") {
                  return (
                    <div
                      key={element.id}
                      className={`absolute cursor-move select-none ${
                        isSelected
                          ? "ring-2 ring-blue-500"
                          : element.isDynamic
                          ? "ring-1 ring-green-400/40"
                          : ""
                      }`}
                      style={{
                        left: displayX,
                        top: displayY,
                        width: displayWidth,
                        minHeight: displayHeight,
                        fontSize: (element.fontSize || 16) * zoom * 2,
                        fontFamily: element.font || "Arial",
                        fontWeight: element.fontStyle?.includes("bold")
                          ? "bold"
                          : "normal",
                        fontStyle: element.fontStyle?.includes("italic")
                          ? "italic"
                          : "normal",
                        color: element.color || "#000000",
                        textAlign: element.align || "left",
                        padding: "2px 4px",
                        lineHeight: "1.2",
                        wordBreak: "break-word",
                        backgroundColor: element.isDynamic
                          ? "rgba(34, 197, 94, 0.05)"
                          : "transparent",
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element)}
                      onDoubleClick={() => handleDoubleClick(element)}
                    >
                      {element.isDynamic && !isSelected && (
                        <div className="absolute -top-4 left-0 text-xs text-green-400 font-medium bg-green-500/20 px-2 py-0.5 rounded">
                          CSV
                        </div>
                      )}
                      {element.text}
                      {isSelected && (
                        <div className="absolute -right-2 -top-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeElement(element.id);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                } else if (element.type === "image") {
                  return (
                    <div
                      key={element.id}
                      className={`absolute cursor-move ${
                        isSelected ? "ring-2 ring-blue-500" : ""
                      }`}
                      style={{
                        left: displayX,
                        top: displayY,
                        width: displayWidth,
                        height: displayHeight,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element)}
                    >
                      <img
                        src={element.image}
                        alt="Element"
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                      {isSelected && (
                        <div className="absolute -right-2 -top-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeElement(element.id);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                } else if (element.type === "rectangle") {
                  return (
                    <div
                      key={element.id}
                      className={`absolute cursor-move ${
                        isSelected ? "ring-2 ring-blue-500" : ""
                      }`}
                      style={{
                        left: displayX,
                        top: displayY,
                        width: displayWidth,
                        height: displayHeight,
                        backgroundColor: element.filled
                          ? element.color
                          : "transparent",
                        border: `${element.borderWidth || 2}px solid ${
                          element.color || "#000"
                        }`,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element)}
                    >
                      {isSelected && (
                        <div className="absolute -right-2 -top-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeElement(element.id);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                } else if (element.type === "line") {
                  return (
                    <div
                      key={element.id}
                      className={`absolute cursor-move ${
                        isSelected ? "ring-2 ring-blue-500" : ""
                      }`}
                      style={{
                        left: displayX,
                        top: displayY,
                        width: displayWidth,
                        height: (element.borderWidth || 2) * zoom * 2,
                        backgroundColor: element.color || "#000",
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element)}
                    >
                      {isSelected && (
                        <div className="absolute -right-2 -top-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeElement(element.id);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}

              {/* Border */}
              {template.border && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    inset: (template.border.margin || 15) * zoom * 2,
                    border: `${
                      (template.border.width || 2) * zoom * 2
                    }px solid ${template.border.color || "#000"}`,
                  }}
                />
              )}
            </div>
          </div>

          <div className="mt-3 text-center text-xs text-gray-400 space-y-1">
            <p>💡 Click to select • Drag to move • Double-click text to edit</p>
            <p className="text-green-400/70">
              🟢 Green ring = Dynamic (CSV data)
            </p>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-white">Properties</h4>

          {selectedElementData ? (
            <div className="space-y-3">
              {/* Text Properties */}
              {selectedElementData.type === "text" && (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Text
                    </label>
                    <textarea
                      value={selectedElementData.text}
                      onChange={(e) =>
                        updateElement(selectedElement, { text: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      rows="3"
                      placeholder="Enter text or {{field}}"
                    />
                    {availableFields.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {availableFields.slice(0, 4).map((field, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              updateElement(selectedElement, {
                                text: `{{${field}}}`,
                                isDynamic: true,
                                dataField: field,
                              })
                            }
                            className="px-2 py-1 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-secondary rounded text-xs"
                          >
                            {field}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* NEW: Dynamic Field Toggle */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedElementData.isDynamic || false}
                        onChange={(e) =>
                          updateElement(selectedElement, {
                            isDynamic: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-medium text-blue-400">
                          Dynamic Element
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {selectedElementData.isDynamic
                            ? "✓ Will be replaced with CSV data"
                            : "Fixed text, same on all certificates"}
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Size
                      </label>
                      <input
                        type="number"
                        value={selectedElementData.fontSize || 16}
                        onChange={(e) =>
                          updateElement(selectedElement, {
                            fontSize: parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        min="8"
                        max="72"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={selectedElementData.color || "#000000"}
                        onChange={(e) =>
                          updateElement(selectedElement, {
                            color: e.target.value,
                          })
                        }
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2">
                      Style
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const current =
                            selectedElementData.fontStyle || "normal";
                          updateElement(selectedElement, {
                            fontStyle: current.includes("bold")
                              ? current.replace("bold", "")
                              : current + "bold",
                          });
                        }}
                        className={`flex-1 p-2 rounded-lg transition-colors ${
                          selectedElementData.fontStyle?.includes("bold")
                            ? "bg-blue-500 text-white"
                            : "bg-white/5 text-gray-400"
                        }`}
                      >
                        <Bold size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => {
                          const current =
                            selectedElementData.fontStyle || "normal";
                          updateElement(selectedElement, {
                            fontStyle: current.includes("italic")
                              ? current.replace("italic", "")
                              : current + "italic",
                          });
                        }}
                        className={`flex-1 p-2 rounded-lg transition-colors ${
                          selectedElementData.fontStyle?.includes("italic")
                            ? "bg-blue-500 text-white"
                            : "bg-white/5 text-gray-400"
                        }`}
                      >
                        <Italic size={16} className="mx-auto" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2">
                      Align
                    </label>
                    <div className="flex gap-2">
                      {["left", "center", "right"].map((align) => (
                        <button
                          key={align}
                          onClick={() =>
                            updateElement(selectedElement, { align })
                          }
                          className={`flex-1 p-2 rounded-lg transition-colors ${
                            selectedElementData.align === align
                              ? "bg-blue-500 text-white"
                              : "bg-white/5 text-gray-400"
                          }`}
                        >
                          {align === "left" && (
                            <AlignLeft size={16} className="mx-auto" />
                          )}
                          {align === "center" && (
                            <AlignCenter size={16} className="mx-auto" />
                          )}
                          {align === "right" && (
                            <AlignRight size={16} className="mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Shape Properties */}
              {(selectedElementData.type === "rectangle" ||
                selectedElementData.type === "line") && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={selectedElementData.color || "#000000"}
                    onChange={(e) =>
                      updateElement(selectedElement, { color: e.target.value })
                    }
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Position & Size */}
              <div className="pt-3 border-t border-white/10">
                <label className="block text-xs text-gray-400 mb-2">
                  Position & Size (in mm)
                </label>
                <div className="text-xs text-gray-500 mb-2 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1">
                  Canvas: {Math.round(dims.actualWidth)} x{" "}
                  {Math.round(dims.actualHeight)} mm
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      X (mm)
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedElementData.x)}
                      onChange={(e) =>
                        updateElement(selectedElement, {
                          x: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Y (mm)
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedElementData.y)}
                      onChange={(e) =>
                        updateElement(selectedElement, {
                          y: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      W (mm)
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedElementData.width || 100)}
                      onChange={(e) =>
                        updateElement(selectedElement, {
                          width: parseInt(e.target.value) || 100,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      H (mm)
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedElementData.height || 30)}
                      onChange={(e) =>
                        updateElement(selectedElement, {
                          height: parseInt(e.target.value) || 30,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeElement(selectedElement)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                <Trash2 size={14} />
                <span>Delete Element</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p>Select an element to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFTemplateDesigner;
