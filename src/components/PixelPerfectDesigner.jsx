import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, Textbox, Rect, Line, FabricImage, Circle } from "fabric";
import {
  Type,
  Square,
  Minus,
  Trash2,
  Copy,
  Layers,
  Upload,
  FileText,
  Download,
  Sparkles,
  Eye,
  EyeOff,
  X,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  MoveUp,
  MoveDown,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Image as ImageIcon,
} from "lucide-react";
import canvasPdfGenerator from "../services/canvasPdfGenerator";
import PDFPreviewOverlay from "./PDFPreviewOverlay";

const PixelPerfectDesigner = ({ template, onTemplateChange }) => {
  const canvasContainerRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerDivRef = useRef(null);
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);
  const previewUpdateTimeoutRef = useRef(null);
  const previewBlobUrlRef = useRef(null);

  const [selectedObject, setSelectedObject] = useState(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [scale, setScale] = useState(1);
  const [csvData, setCsvData] = useState([]);
  const [csvFields, setCsvFields] = useState([]);
  const [batchInfo, setBatchInfo] = useState({ courseName: "", batchName: "" });
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showRecipientsList, setShowRecipientsList] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Preview overlay state
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewOpacity, setPreviewOpacity] = useState(0.8);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Properties panel state
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);

  // A4 dimensions in mm
  const A4_WIDTH = template.orientation === "landscape" ? 297 : 210;
  const A4_HEIGHT = template.orientation === "landscape" ? 210 : 297;

  // Canvas display size (pixels) - scale factor of 2 for better quality
  const CANVAS_SCALE = 2;
  const canvasWidth = A4_WIDTH * CANVAS_SCALE;
  const canvasHeight = A4_HEIGHT * CANVAS_SCALE;

  // Calculate scale to fit container - maximize canvas size
  useEffect(() => {
    const calculateScale = () => {
      if (!containerDivRef.current) return;

      const container = containerDivRef.current;
      const containerWidth = container.clientWidth - 32; // More padding
      const containerHeight = container.clientHeight - 32;

      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;

      // Use 95% of available space to maximize canvas size
      const newScale = Math.min(scaleX, scaleY) * 0.95;
      setScale(Math.max(newScale, 0.5)); // Minimum scale of 0.5
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    const timer = setTimeout(calculateScale, 100);
    const timer2 = setTimeout(calculateScale, 500); // Recalculate after render

    return () => {
      window.removeEventListener("resize", calculateScale);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [canvasWidth, canvasHeight]);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasContainerRef.current || fabricCanvasRef.current) return;

    const canvas = new Canvas(canvasContainerRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: template.backgroundColor || "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;
    setCanvasReady(true);

    // Selection events
    canvas.on("selection:created", handleSelectionChange);
    canvas.on("selection:updated", handleSelectionChange);
    canvas.on("selection:cleared", () => setSelectedObject(null));
    canvas.on("mouse:down", (e) => {
      if (e.target) {
        handleSelectionChange({ selected: [e.target], target: e.target });
      }
    });

    // Modification events - trigger preview update
    canvas.on("object:modified", () => {
      saveCanvasState();
      updatePreview();
    });
    canvas.on("object:added", () => {
      saveCanvasState();
      updatePreview();
    });
    canvas.on("object:removed", () => {
      saveCanvasState();
      updatePreview();
    });
    canvas.on("object:moving", () => {
      // Update preview while moving (throttled)
      if (previewUpdateTimeoutRef.current) {
        clearTimeout(previewUpdateTimeoutRef.current);
      }
      previewUpdateTimeoutRef.current = setTimeout(updatePreview, 300);
    });

    // Text editing events
    canvas.on("text:editing:entered", () => {
      canvas.renderAll();
    });
    canvas.on("text:editing:exited", () => {
      saveCanvasState();
      updatePreview();
    });

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load template elements once canvas is ready
  useEffect(() => {
    if (!canvasReady || !fabricCanvasRef.current) return;
    loadTemplateElements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady, template]);

  // Update preview when template changes or canvas is ready
  useEffect(() => {
    if (showPreviewOverlay && canvasReady && fabricCanvasRef.current) {
      // Small delay to ensure canvas is fully rendered
      const timer = setTimeout(() => {
        updatePreview();
      }, 200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, showPreviewOverlay, canvasReady]);

  // Cleanup preview blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
      }
    };
  }, []);

  const handleSelectionChange = useCallback((e) => {
    const activeObject = e.selected?.[0] || e.target;
    if (!activeObject) {
      setSelectedObject(null);
      return;
    }

    setSelectedObject({
      type: activeObject.type,
      left: Math.round(activeObject.left / CANVAS_SCALE),
      top: Math.round(activeObject.top / CANVAS_SCALE),
      width: Math.round((activeObject.width * (activeObject.scaleX || 1)) / CANVAS_SCALE),
      height: Math.round((activeObject.height * (activeObject.scaleY || 1)) / CANVAS_SCALE),
      angle: Math.round(activeObject.angle || 0),
      fontSize: activeObject.fontSize ? Math.round(activeObject.fontSize / CANVAS_SCALE) : null,
      fontFamily: activeObject.fontFamily || null,
      fontWeight: activeObject.fontWeight || "normal",
      fontStyle: activeObject.fontStyle || "normal",
      textAlign: activeObject.textAlign || "left",
      fill: activeObject.fill || "#000000",
      stroke: activeObject.stroke || null,
      strokeWidth: activeObject.strokeWidth ? activeObject.strokeWidth / CANVAS_SCALE : null,
      fabricObject: activeObject,
      isDynamic: activeObject.isDynamic || false,
      dataField: activeObject.dataField || null,
    });
  }, []);

  const loadTemplateElements = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = template.backgroundColor || "#ffffff";

    // Load elements
    template.elements?.forEach((element) => {
      if (element.type === "text") {
        const text = new Textbox(element.text || "Text", {
          left: element.x * CANVAS_SCALE,
          top: element.y * CANVAS_SCALE,
          fontSize: (element.fontSize || 16) * CANVAS_SCALE,
          fill: element.color || "#000000",
          fontFamily: element.font || "Arial",
          fontWeight: element.fontStyle?.includes("bold") ? "bold" : "normal",
          fontStyle: element.fontStyle?.includes("italic") ? "italic" : "normal",
          width: (element.width || 200) * CANVAS_SCALE,
          textAlign: element.align || "left",
          editable: true,
        });
        if (element.isDynamic && element.dataField) {
          text.set("isDynamic", true);
          text.set("dataField", element.dataField);
        }
        canvas.add(text);
      } else if (element.type === "rectangle") {
        const rect = new Rect({
          left: element.x * CANVAS_SCALE,
          top: element.y * CANVAS_SCALE,
          width: (element.width || 100) * CANVAS_SCALE,
          height: (element.height || 50) * CANVAS_SCALE,
          fill: element.filled ? element.color || "#cccccc" : "transparent",
          stroke: element.color || "#000000",
          strokeWidth: (element.borderWidth || 2) * CANVAS_SCALE,
        });
        canvas.add(rect);
      } else if (element.type === "circle") {
        const circle = new Circle({
          left: element.x * CANVAS_SCALE,
          top: element.y * CANVAS_SCALE,
          radius: (element.radius || 50) * CANVAS_SCALE,
          fill: element.filled ? element.color || "#cccccc" : "transparent",
          stroke: element.color || "#000000",
          strokeWidth: (element.borderWidth || 2) * CANVAS_SCALE,
        });
        canvas.add(circle);
      } else if (element.type === "line") {
        const line = new Line(
          [
            element.x * CANVAS_SCALE,
            element.y * CANVAS_SCALE,
            (element.x + (element.width || 100)) * CANVAS_SCALE,
            element.y * CANVAS_SCALE,
          ],
          {
            stroke: element.color || "#000000",
            strokeWidth: (element.height || 2) * CANVAS_SCALE,
          }
        );
        canvas.add(line);
      } else if (element.type === "image") {
        // Load image
        FabricImage.fromURL(
          element.src,
          (img) => {
            img.set({
              left: element.x * CANVAS_SCALE,
              top: element.y * CANVAS_SCALE,
              scaleX: ((element.width || 100) * CANVAS_SCALE) / img.width,
              scaleY: ((element.height || 100) * CANVAS_SCALE) / img.height,
            });
            canvas.add(img);
            canvas.renderAll();
          },
          { crossOrigin: "anonymous" }
        );
      }
    });

    canvas.renderAll();
  };

  const saveCanvasState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !onTemplateChange) return;

    const elements = canvas
      .getObjects()
      .map((obj) => {
        const baseProps = {
          id: obj.id || `element-${Date.now()}`,
          x: Math.round(obj.left / CANVAS_SCALE),
          y: Math.round(obj.top / CANVAS_SCALE),
          rotation: Math.round(obj.angle || 0),
        };

        if (obj.type === "textbox" || obj.type === "i-text") {
          return {
            ...baseProps,
            type: "text",
            text: obj.text,
            fontSize: Math.round(obj.fontSize / CANVAS_SCALE),
            font: obj.fontFamily || "Arial",
            fontStyle: `${obj.fontWeight || "normal"} ${obj.fontStyle || "normal"}`.trim(),
            color: obj.fill || "#000000",
            align: obj.textAlign || "left",
            width: Math.round(obj.width / CANVAS_SCALE),
            isDynamic: obj.isDynamic || false,
            dataField: obj.dataField || null,
          };
        } else if (obj.type === "rect") {
          return {
            ...baseProps,
            type: "rectangle",
            width: Math.round((obj.width * obj.scaleX) / CANVAS_SCALE),
            height: Math.round((obj.height * obj.scaleY) / CANVAS_SCALE),
            color: obj.stroke,
            filled: obj.fill !== "transparent",
            borderWidth: Math.round(obj.strokeWidth / CANVAS_SCALE),
          };
        } else if (obj.type === "circle") {
          return {
            ...baseProps,
            type: "circle",
            radius: Math.round((obj.radius * obj.scaleX) / CANVAS_SCALE),
            color: obj.stroke,
            filled: obj.fill !== "transparent",
            borderWidth: Math.round(obj.strokeWidth / CANVAS_SCALE),
          };
        } else if (obj.type === "line") {
          return {
            ...baseProps,
            type: "line",
            width: Math.round((obj.x2 - obj.x1) / CANVAS_SCALE),
            height: Math.round(obj.strokeWidth / CANVAS_SCALE),
            color: obj.stroke,
          };
        } else if (obj.type === "image") {
          return {
            ...baseProps,
            type: "image",
            width: Math.round((obj.width * obj.scaleX) / CANVAS_SCALE),
            height: Math.round((obj.height * obj.scaleY) / CANVAS_SCALE),
            src: obj.getSrc ? obj.getSrc() : obj._element?.src || obj.src,
          };
        }
        return null;
      })
      .filter(Boolean);

    onTemplateChange({
      ...template,
      elements,
      useCanvasGeneration: true,
      fabricCanvas: fabricCanvasRef.current,
    });
  }, [template, onTemplateChange]);

  // Update preview PDF (debounced)
  const updatePreview = useCallback(async () => {
    if (!showPreviewOverlay || !fabricCanvasRef.current) return;

    // Clear existing timeout
    if (previewUpdateTimeoutRef.current) {
      clearTimeout(previewUpdateTimeoutRef.current);
    }

    // Debounce preview generation
    previewUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        setIsGeneratingPreview(true);

        // Get current data for preview (use selected recipient if in preview mode)
        const data = previewMode && selectedRecipient ? selectedRecipient : previewData;

        // Generate preview
        const blobUrl = await canvasPdfGenerator.generatePreview(
          fabricCanvasRef.current,
          template,
          data,
          batchInfo
        );

        // Revoke old blob URL
        if (previewBlobUrlRef.current) {
          URL.revokeObjectURL(previewBlobUrlRef.current);
        }

        // Set new blob URL
        previewBlobUrlRef.current = blobUrl;
        setPreviewBlobUrl(blobUrl);
      } catch (error) {
        console.error("Error generating preview:", error);
      } finally {
        setIsGeneratingPreview(false);
      }
    }, 500); // 500ms debounce
  }, [showPreviewOverlay, template, previewMode, selectedRecipient, previewData, batchInfo]);

  // Toggle preview overlay
  const togglePreviewOverlay = useCallback(async () => {
    if (!showPreviewOverlay) {
      // Opening preview - generate initial preview
      setShowPreviewOverlay(true);
      await updatePreview();
    } else {
      // Closing preview
      setShowPreviewOverlay(false);
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
        previewBlobUrlRef.current = null;
        setPreviewBlobUrl(null);
      }
    }
  }, [showPreviewOverlay, updatePreview]);

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new Textbox("Double-click to edit", {
      left: 100 * CANVAS_SCALE,
      top: 100 * CANVAS_SCALE,
      fontSize: 16 * CANVAS_SCALE,
      fill: "#000000",
      fontFamily: "Arial",
      width: 200 * CANVAS_SCALE,
      editable: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveCanvasState();
    updatePreview();
  };

  const addRectangle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const rect = new Rect({
      left: 100 * CANVAS_SCALE,
      top: 100 * CANVAS_SCALE,
      width: 200 * CANVAS_SCALE,
      height: 100 * CANVAS_SCALE,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 2 * CANVAS_SCALE,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    saveCanvasState();
    updatePreview();
  };

  const addCircle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const circle = new Circle({
      left: 100 * CANVAS_SCALE,
      top: 100 * CANVAS_SCALE,
      radius: 50 * CANVAS_SCALE,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 2 * CANVAS_SCALE,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    saveCanvasState();
    updatePreview();
  };

  const addLine = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const line = new Line(
      [
        100 * CANVAS_SCALE,
        100 * CANVAS_SCALE,
        300 * CANVAS_SCALE,
        100 * CANVAS_SCALE,
      ],
      {
        stroke: "#000000",
        strokeWidth: 2 * CANVAS_SCALE,
      }
    );
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
    saveCanvasState();
    updatePreview();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      FabricImage.fromURL(
        event.target.result,
        (img) => {
          img.set({
            left: 100 * CANVAS_SCALE,
            top: 100 * CANVAS_SCALE,
            scaleX: (200 * CANVAS_SCALE) / img.width,
            scaleY: (200 * CANVAS_SCALE) / img.height,
          });
          fabricCanvasRef.current.add(img);
          fabricCanvasRef.current.renderAll();
          saveCanvasState();
          updatePreview();
        },
        { crossOrigin: "anonymous" }
      );
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject) return;

    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
    saveCanvasState();
    updatePreview();
  };

  const handleDuplicate = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject?.fabricObject) return;

    const obj = selectedObject.fabricObject;
    obj.clone((cloned) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      saveCanvasState();
      updatePreview();
    });
  };

  const handleBringToFront = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject?.fabricObject) return;

    selectedObject.fabricObject.bringToFront();
    canvas.renderAll();
    saveCanvasState();
    updatePreview();
  };

  const handleSendToBack = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject?.fabricObject) return;

    selectedObject.fabricObject.sendToBack();
    canvas.renderAll();
    saveCanvasState();
    updatePreview();
  };

  const handleToggleLock = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject?.fabricObject) return;

    const obj = selectedObject.fabricObject;
    obj.set("selectable", obj.selectable === false);
    obj.set("evented", obj.evented === false);
    canvas.renderAll();
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").filter((row) => row.trim());
      const headers = rows[0].split(",").map((h) => h.trim());
      const data = rows.slice(1).map((row) => {
        const values = row.split(",").map((v) => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || "";
        });
        return obj;
      });
      setCsvData(data);
      setCsvFields(headers);
      setShowCsvModal(true);
    };
    reader.readAsText(file);
  };

  const updateTextProperty = (property, value) => {
    if (!selectedObject?.fabricObject) return;

    const obj = selectedObject.fabricObject;
    if (property === "fontSize") {
      obj.set("fontSize", value * CANVAS_SCALE);
    } else if (property === "fontFamily") {
      obj.set("fontFamily", value);
    } else if (property === "fontWeight") {
      obj.set("fontWeight", value);
    } else if (property === "fontStyle") {
      obj.set("fontStyle", value);
    } else if (property === "textAlign") {
      obj.set("textAlign", value);
    } else if (property === "fill") {
      obj.set("fill", value);
    } else {
      obj.set(property, value);
    }

    fabricCanvasRef.current.renderAll();
    handleSelectionChange({ selected: [obj] });
    updatePreview();
  };

  const updateShapeProperty = (property, value) => {
    if (!selectedObject?.fabricObject) return;

    const obj = selectedObject.fabricObject;
    if (property === "strokeWidth") {
      obj.set("strokeWidth", value * CANVAS_SCALE);
    } else {
      obj.set(property, value);
    }

    fabricCanvasRef.current.renderAll();
    handleSelectionChange({ selected: [obj] });
    updatePreview();
  };

  return (
    <div className="flex flex-col bg-gray-800 text-white" style={{ height: '100%', minHeight: '600px', maxHeight: '100%' }}>
      {/* Toolbar */}
      <div className="bg-gray-900 p-2 flex items-center gap-2 border-b border-gray-700 flex-shrink-0">
        {/* Design Tools */}
        <button
          onClick={addText}
          className="p-2 hover:bg-gray-700 rounded"
          title="Add Text"
        >
          <Type size={18} />
        </button>
        <button
          onClick={addRectangle}
          className="p-2 hover:bg-gray-700 rounded"
          title="Add Rectangle"
        >
          <Square size={18} />
        </button>
        <button
          onClick={addCircle}
          className="p-2 hover:bg-gray-700 rounded"
          title="Add Circle"
        >
          <div className="w-4 h-4 rounded-full border-2 border-current" />
        </button>
        <button
          onClick={addLine}
          className="p-2 hover:bg-gray-700 rounded"
          title="Add Line"
        >
          <Minus size={18} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-700 rounded"
          title="Upload Image"
        >
          <ImageIcon size={18} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />

        <div className="w-px h-6 bg-gray-700 mx-2"></div>

        {/* Element Controls */}
        <button
          onClick={handleDuplicate}
          disabled={!selectedObject}
          className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Duplicate"
        >
          <Copy size={18} />
        </button>
        <button
          onClick={handleBringToFront}
          disabled={!selectedObject}
          className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Bring to Front"
        >
          <MoveUp size={18} />
        </button>
        <button
          onClick={handleSendToBack}
          disabled={!selectedObject}
          className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Send to Back"
        >
          <MoveDown size={18} />
        </button>
        <button
          onClick={handleToggleLock}
          disabled={!selectedObject}
          className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Lock/Unlock"
        >
          {selectedObject?.fabricObject?.selectable === false ? (
            <Lock size={18} />
          ) : (
            <Unlock size={18} />
          )}
        </button>
        <button
          onClick={handleDelete}
          disabled={!selectedObject}
          className="p-2 hover:bg-red-700 rounded disabled:opacity-50"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>

        <div className="w-px h-6 bg-gray-700 mx-2"></div>

        {/* CSV Upload */}
        <button
          onClick={() => csvInputRef.current?.click()}
          className={`p-2 rounded ${
            csvData.length > 0
              ? "bg-green-600 hover:bg-green-700"
              : "hover:bg-gray-700"
          }`}
          title="Upload CSV for Batch Generation"
        >
          <Upload size={18} />
        </button>
        <input
          type="file"
          ref={csvInputRef}
          onChange={handleCsvUpload}
          className="hidden"
          accept=".csv"
        />

        <div className="flex-grow"></div>

        {/* Preview Toggle */}
        <button
          onClick={togglePreviewOverlay}
          className={`p-2 rounded flex items-center gap-2 ${
            showPreviewOverlay
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          title="Toggle PDF Preview Overlay"
        >
          {showPreviewOverlay ? (
            <>
              <EyeOff size={18} />
              <span className="text-sm">Hide Preview</span>
            </>
          ) : (
            <>
              <Eye size={18} />
              <span className="text-sm">Show Preview</span>
            </>
          )}
          {isGeneratingPreview && (
            <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </button>

        {/* Export */}
        <button
          onClick={async () => {
            const pdf = await canvasPdfGenerator.generateFromCanvas(
              fabricCanvasRef.current,
              template
            );
            pdf.save("certificate.pdf");
          }}
          className="p-2 bg-green-600 hover:bg-green-700 rounded flex items-center gap-2"
          title="Export PDF"
        >
          <Download size={18} />
          <span className="text-sm">Export</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas Area - Full Screen */}
        <div
          ref={containerDivRef}
          className="flex-1 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 flex items-center justify-center overflow-auto relative"
          style={{ minHeight: 0, height: '100%', width: '100%' }}
        >
          <div
            className="relative bg-white shadow-2xl rounded-lg overflow-visible"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              minWidth: `${canvasWidth}px`,
              minHeight: `${canvasHeight}px`,
            }}
          >
            <canvas 
              ref={canvasContainerRef}
              style={{ 
                display: 'block',
                cursor: 'default',
                touchAction: 'none',
                position: 'relative',
                zIndex: 1
              }}
            />
            
            {/* Preview Overlay - Positioned absolutely over canvas */}
            {showPreviewOverlay && (
              <div style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: previewOpacity < 0.5 ? 'none' : 'auto',
                zIndex: 2
              }}>
                <PDFPreviewOverlay
                  pdfBlobUrl={previewBlobUrl}
                  isVisible={showPreviewOverlay}
                  onClose={() => setShowPreviewOverlay(false)}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  canvasScale={scale}
                  opacity={previewOpacity}
                  onOpacityChange={setPreviewOpacity}
                />
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel - Collapsible */}
        {showPropertiesPanel && (
          <div className="w-80 bg-gray-900 p-4 border-l border-gray-700 overflow-y-auto flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Properties</h3>
              <button
                onClick={() => setShowPropertiesPanel(false)}
                className="p-1 hover:bg-gray-700 rounded"
                title="Hide Properties Panel"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {selectedObject ? (
              <div className="space-y-4">
                {/* Text Properties */}
                {(selectedObject.type === "textbox" ||
                  selectedObject.type === "i-text") && (
                  <>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">
                        Text
                      </label>
                      <textarea
                        value={selectedObject.fabricObject?.text || ""}
                      onChange={(e) => {
                        selectedObject.fabricObject?.set("text", e.target.value);
                        fabricCanvasRef.current?.renderAll();
                        saveCanvasState();
                        updatePreview();
                      }}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">
                        Font Size
                      </label>
                      <input
                        type="number"
                        value={selectedObject.fontSize || 16}
                        onChange={(e) =>
                          updateTextProperty(
                            "fontSize",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">
                        Font Family
                      </label>
                      <select
                        value={selectedObject.fontFamily || "Arial"}
                        onChange={(e) =>
                          updateTextProperty("fontFamily", e.target.value)
                        }
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">
                        Text Align
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTextProperty("textAlign", "left")}
                          className={`p-2 rounded ${
                            selectedObject.textAlign === "left"
                              ? "bg-blue-600"
                              : "bg-gray-700"
                          }`}
                        >
                          <AlignLeft size={16} />
                        </button>
                        <button
                          onClick={() =>
                            updateTextProperty("textAlign", "center")
                          }
                          className={`p-2 rounded ${
                            selectedObject.textAlign === "center"
                              ? "bg-blue-600"
                              : "bg-gray-700"
                          }`}
                        >
                          <AlignCenter size={16} />
                        </button>
                        <button
                          onClick={() => updateTextProperty("textAlign", "right")}
                          className={`p-2 rounded ${
                            selectedObject.textAlign === "right"
                              ? "bg-blue-600"
                              : "bg-gray-700"
                          }`}
                        >
                          <AlignRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={selectedObject.fill || "#000000"}
                        onChange={(e) => updateTextProperty("fill", e.target.value)}
                        className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">
                        Dynamic Field (CSV)
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedObject.isDynamic || false}
                          onChange={(e) => {
                            selectedObject.fabricObject?.set(
                              "isDynamic",
                              e.target.checked
                            );
                            if (!e.target.checked) {
                              selectedObject.fabricObject?.set("dataField", null);
                            }
                            fabricCanvasRef.current?.renderAll();
                            saveCanvasState();
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-300">
                          Use CSV data
                        </span>
                      </div>
                      {selectedObject.isDynamic && (
                        <input
                          type="text"
                          placeholder="Field name (e.g., name)"
                          value={selectedObject.dataField || ""}
                          onChange={(e) => {
                            selectedObject.fabricObject?.set(
                              "dataField",
                              e.target.value
                            );
                            fabricCanvasRef.current?.renderAll();
                            saveCanvasState();
                          }}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                      )}
                    </div>
                  </>
                )}

                {/* Shape Properties */}
                {(selectedObject.type === "rect" ||
                  selectedObject.type === "circle") && (
                  <>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">
                        Fill Color
                      </label>
                      <input
                        type="color"
                        value={selectedObject.fabricObject?.fill || "#000000"}
                        onChange={(e) =>
                          updateShapeProperty("fill", e.target.value)
                        }
                        className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">
                        Stroke Color
                      </label>
                      <input
                        type="color"
                        value={selectedObject.stroke || "#000000"}
                        onChange={(e) =>
                          updateShapeProperty("stroke", e.target.value)
                        }
                        className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-1">
                        Stroke Width
                      </label>
                      <input
                        type="number"
                        value={selectedObject.strokeWidth || 2}
                        onChange={(e) =>
                          updateShapeProperty(
                            "strokeWidth",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                  </>
                )}

                {/* Position & Size */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">X</label>
                    <input
                      type="number"
                      value={selectedObject.left || 0}
                      onChange={(e) => {
                        selectedObject.fabricObject?.set(
                          "left",
                          parseInt(e.target.value) * CANVAS_SCALE
                        );
                        fabricCanvasRef.current?.renderAll();
                        updatePreview();
                      }}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Y</label>
                    <input
                      type="number"
                      value={selectedObject.top || 0}
                      onChange={(e) => {
                        selectedObject.fabricObject?.set(
                          "top",
                          parseInt(e.target.value) * CANVAS_SCALE
                        );
                        fabricCanvasRef.current?.renderAll();
                        updatePreview();
                      }}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Width</label>
                    <input
                      type="number"
                      value={selectedObject.width || 0}
                      onChange={(e) => {
                        selectedObject.fabricObject?.set(
                          "width",
                          parseInt(e.target.value) * CANVAS_SCALE
                        );
                        fabricCanvasRef.current?.renderAll();
                        updatePreview();
                      }}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Height</label>
                    <input
                      type="number"
                      value={selectedObject.height || 0}
                      onChange={(e) => {
                        if (selectedObject.type === "circle") {
                          selectedObject.fabricObject?.set(
                            "radius",
                            parseInt(e.target.value) * CANVAS_SCALE
                          );
                        } else {
                          selectedObject.fabricObject?.set(
                            "height",
                            parseInt(e.target.value) * CANVAS_SCALE
                          );
                        }
                        fabricCanvasRef.current?.renderAll();
                        updatePreview();
                      }}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Select an element to see its properties.
              </p>
            )}
          </div>
        )}

        {!showPropertiesPanel && (
          <button
            onClick={() => setShowPropertiesPanel(true)}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-l-lg p-2 z-10 shadow-lg"
            title="Show Properties Panel"
          >
            <span className="text-gray-400 text-sm">◀</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PixelPerfectDesigner;

