import React, { useEffect, useRef, useState } from "react";
import { Canvas, IText, Rect, Line, Image as FabricImage } from "fabric";
import {
  Type,
  Image as ImageIcon,
  Square,
  Minus,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Copy,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
} from "lucide-react";

const FabricDesigner = ({ template, onTemplateChange }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [zoom, setZoom] = useState(0.8);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const isLandscape = template.orientation === "landscape";
    // A4 dimensions in pixels at 2x scale (similar to current implementation)
    const canvasWidth = isLandscape ? 594 : 420;
    const canvasHeight = isLandscape ? 420 : 594;

    fabricCanvasRef.current = new Canvas(canvasRef.current, {
      width: canvasWidth * zoom,
      height: canvasHeight * zoom,
      backgroundColor: template.backgroundColor || "#ffffff",
      preserveObjectStacking: true,
    });

    // Load existing elements from template
    loadTemplateElements();

    // Selection event
    fabricCanvasRef.current.on("selection:created", handleSelection);
    fabricCanvasRef.current.on("selection:updated", handleSelection);
    fabricCanvasRef.current.on("selection:cleared", () =>
      setSelectedObject(null)
    );

    // Modification events for history
    fabricCanvasRef.current.on("object:modified", saveState);
    fabricCanvasRef.current.on("object:added", saveState);
    fabricCanvasRef.current.on("object:removed", saveState);

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle zoom changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const isLandscape = template.orientation === "landscape";
      const canvasWidth = isLandscape ? 594 : 420;
      const canvasHeight = isLandscape ? 420 : 594;

      fabricCanvasRef.current.setDimensions({
        width: canvasWidth * zoom,
        height: canvasHeight * zoom,
      });
      fabricCanvasRef.current.setZoom(zoom);
      fabricCanvasRef.current.renderAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const handleSelection = (e) => {
    const obj = e.selected[0];
    if (obj) {
      setSelectedObject({
        type: obj.customType || "text",
        text: obj.text || "",
        left: Math.round(obj.left / 2), // Convert to mm
        top: Math.round(obj.top / 2),
        width: Math.round((obj.width * obj.scaleX) / 2),
        height: Math.round((obj.height * obj.scaleY) / 2),
        fontSize: obj.fontSize || 16,
        fill: obj.fill || "#000000",
        fontFamily: obj.fontFamily || "Arial",
        fontWeight: obj.fontWeight || "normal",
        fontStyle: obj.fontStyle || "normal",
        textAlign: obj.textAlign || "left",
        angle: obj.angle || 0,
        isDynamic: obj.isDynamic || false,
        dataField: obj.dataField || null,
        fabricObject: obj,
      });
    }
  };

  const loadTemplateElements = () => {
    if (!fabricCanvasRef.current || !template.elements) return;

    fabricCanvasRef.current.clear();

    // Add background image if exists
    if (template.backgroundImage) {
      FabricImage.fromURL(template.backgroundImage, (img) => {
        img.set({
          left: 0,
          top: 0,
          scaleX: fabricCanvasRef.current.width / img.width,
          scaleY: fabricCanvasRef.current.height / img.height,
          selectable: false,
          evented: false,
        });
        fabricCanvasRef.current.setBackgroundImage(
          img,
          fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current)
        );
      });
    }

    // Convert template elements to Fabric objects
    template.elements.forEach((element) => {
      if (element.type === "text") {
        const text = new IText(element.text || "Text", {
          left: element.x * 2, // Convert mm to pixels
          top: element.y * 2,
          fontSize: element.fontSize || 16,
          fill: element.color || "#000000",
          fontFamily: element.font || "Arial",
          fontWeight: element.fontStyle?.includes("bold") ? "bold" : "normal",
          fontStyle: element.fontStyle?.includes("italic")
            ? "italic"
            : "normal",
          textAlign: element.align || "left",
          width: (element.width || 200) * 2,
          customType: "text",
          isDynamic: element.isDynamic || false,
          dataField: element.dataField || null,
        });
        fabricCanvasRef.current.add(text);
      } else if (element.type === "image" && element.image) {
        FabricImage.fromURL(element.image, (img) => {
          img.set({
            left: element.x * 2,
            top: element.y * 2,
            scaleX: ((element.width || 100) * 2) / img.width,
            scaleY: ((element.height || 100) * 2) / img.height,
            customType: "image",
          });
          fabricCanvasRef.current.add(img);
        });
      } else if (element.type === "rectangle") {
        const rect = new Rect({
          left: element.x * 2,
          top: element.y * 2,
          width: (element.width || 100) * 2,
          height: (element.height || 50) * 2,
          fill: element.filled ? element.color || "#cccccc" : "transparent",
          stroke: element.color || "#000000",
          strokeWidth: (element.borderWidth || 2) * 2,
          customType: "rectangle",
        });
        fabricCanvasRef.current.add(rect);
      } else if (element.type === "line") {
        const line = new Line(
          [
            element.x * 2,
            element.y * 2,
            (element.x + element.width) * 2,
            element.y * 2,
          ],
          {
            stroke: element.color || "#000000",
            strokeWidth: (element.height || 2) * 2,
            customType: "line",
          }
        );
        fabricCanvasRef.current.add(line);
      }
    });

    fabricCanvasRef.current.renderAll();
  };

  const saveState = () => {
    const json = fabricCanvasRef.current.toJSON([
      "customType",
      "isDynamic",
      "dataField",
    ]);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Sync back to parent template
    syncToTemplate();
  };

  const syncToTemplate = () => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current.getObjects();
    const elements = objects
      .map((obj) => {
        if (obj.customType === "text") {
          return {
            id: obj.id || `element-${Date.now()}-${Math.random()}`,
            type: "text",
            text: obj.text,
            x: Math.round(obj.left / 2),
            y: Math.round(obj.top / 2),
            width: Math.round((obj.width * obj.scaleX) / 2),
            height: Math.round((obj.height * obj.scaleY) / 2),
            fontSize: obj.fontSize,
            font: obj.fontFamily,
            fontStyle: `${obj.fontWeight} ${obj.fontStyle}`.trim(),
            color: obj.fill,
            align: obj.textAlign,
            isDynamic: obj.isDynamic || false,
            dataField: obj.dataField || null,
          };
        } else if (obj.customType === "image") {
          return {
            id: obj.id || `element-${Date.now()}-${Math.random()}`,
            type: "image",
            image: obj._element?.src || obj.src,
            x: Math.round(obj.left / 2),
            y: Math.round(obj.top / 2),
            width: Math.round((obj.width * obj.scaleX) / 2),
            height: Math.round((obj.height * obj.scaleY) / 2),
          };
        } else if (obj.customType === "rectangle") {
          return {
            id: obj.id || `element-${Date.now()}-${Math.random()}`,
            type: "rectangle",
            x: Math.round(obj.left / 2),
            y: Math.round(obj.top / 2),
            width: Math.round((obj.width * obj.scaleX) / 2),
            height: Math.round((obj.height * obj.scaleY) / 2),
            color: obj.stroke,
            filled: obj.fill !== "transparent",
            borderWidth: Math.round(obj.strokeWidth / 2),
          };
        } else if (obj.customType === "line") {
          return {
            id: obj.id || `element-${Date.now()}-${Math.random()}`,
            type: "line",
            x: Math.round(obj.x1 / 2),
            y: Math.round(obj.y1 / 2),
            width: Math.round((obj.x2 - obj.x1) / 2),
            height: Math.round(obj.strokeWidth / 2),
            color: obj.stroke,
          };
        }
        return null;
      })
      .filter(Boolean);

    onTemplateChange({
      ...template,
      elements,
    });
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      fabricCanvasRef.current.loadFromJSON(history[historyIndex - 1], () => {
        fabricCanvasRef.current.renderAll();
        syncToTemplate();
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      fabricCanvasRef.current.loadFromJSON(history[historyIndex + 1], () => {
        fabricCanvasRef.current.renderAll();
        syncToTemplate();
      });
    }
  };

  const addText = () => {
    const text = new IText("Double click to edit", {
      left: 100 * zoom,
      top: 100 * zoom,
      fontSize: 16,
      fill: "#000000",
      fontFamily: "Arial",
      customType: "text",
      isDynamic: false,
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
  };

  const addRectangle = () => {
    const rect = new Rect({
      left: 100 * zoom,
      top: 100 * zoom,
      width: 150 * zoom,
      height: 100 * zoom,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 2 * zoom,
      customType: "rectangle",
    });
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
  };

  const addLine = () => {
    const line = new Line([100 * zoom, 100 * zoom, 300 * zoom, 100 * zoom], {
      stroke: "#000000",
      strokeWidth: 2 * zoom,
      customType: "line",
    });
    fabricCanvasRef.current.add(line);
    fabricCanvasRef.current.setActiveObject(line);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        FabricImage.fromURL(event.target.result, (img) => {
          img.set({
            left: 100 * zoom,
            top: 100 * zoom,
            scaleX: (100 * zoom) / img.width,
            scaleY: (100 * zoom) / img.height,
            customType: "image",
          });
          fabricCanvasRef.current.add(img);
          fabricCanvasRef.current.setActiveObject(img);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteSelected = () => {
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.remove(activeObject);
      setSelectedObject(null);
    }
  };

  const copySelected = () => {
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      activeObject.clone(
        (cloned) => {
          cloned.set({
            left: activeObject.left + 10,
            top: activeObject.top + 10,
          });
          fabricCanvasRef.current.add(cloned);
          fabricCanvasRef.current.setActiveObject(cloned);
        },
        ["customType", "isDynamic", "dataField"]
      );
    }
  };

  const bringToFront = () => {
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.bringToFront(activeObject);
      fabricCanvasRef.current.renderAll();
    }
  };

  const sendToBack = () => {
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.sendToBack(activeObject);
      fabricCanvasRef.current.renderAll();
    }
  };

  const updateObjectProperty = (property, value) => {
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      activeObject.set(property, value);
      fabricCanvasRef.current.renderAll();
      handleSelection({ selected: [activeObject] });
    }
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Toolbar */}
      <div className="w-16 bg-white/5 border border-white/10 rounded-xl p-2 space-y-2">
        <button
          onClick={addText}
          className="w-full p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-all"
          title="Add Text (T)"
        >
          <Type size={20} />
        </button>

        <label className="block w-full p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 cursor-pointer transition-all">
          <ImageIcon size={20} />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={addRectangle}
          className="w-full p-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-all"
          title="Add Rectangle (R)"
        >
          <Square size={20} />
        </button>

        <button
          onClick={addLine}
          className="w-full p-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 transition-all"
          title="Add Line (L)"
        >
          <Minus size={20} />
        </button>

        <div className="border-t border-white/10 my-2"></div>

        <button
          onClick={copySelected}
          disabled={!selectedObject}
          className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-30 transition-all"
          title="Duplicate (Ctrl+D)"
        >
          <Copy size={20} />
        </button>

        <button
          onClick={deleteSelected}
          disabled={!selectedObject}
          className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 disabled:opacity-30 transition-all"
          title="Delete (Del)"
        >
          <Trash2 size={20} />
        </button>

        <div className="border-t border-white/10 my-2"></div>

        <button
          onClick={bringToFront}
          disabled={!selectedObject}
          className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-30 transition-all"
          title="Bring to Front"
        >
          <Layers size={20} />
        </button>

        <button
          onClick={sendToBack}
          disabled={!selectedObject}
          className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-30 transition-all"
          title="Send to Back"
        >
          <Layers size={20} className="rotate-180" />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-sm text-gray-400 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
          >
            <ZoomIn size={16} />
          </button>

          <div className="flex-1"></div>

          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 text-xs disabled:opacity-30"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 text-xs disabled:opacity-30"
          >
            Redo
          </button>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 overflow-auto flex items-center justify-center">
          <div className="relative">
            <canvas ref={canvasRef} className="shadow-2xl" />
            <div className="mt-3 text-center text-xs text-gray-400">
              <p>
                💡 Fabric.js: Click to select • Drag to move • Double-click text
                to edit inline
              </p>
              <p className="text-green-400/70">
                ✨ Features: Rotation, Resize, Undo/Redo, Layers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedObject && (
        <div className="w-64 bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 overflow-y-auto">
          <h4 className="text-sm font-semibold text-white">Properties</h4>

          {selectedObject.type === "text" && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  value={selectedObject.fontSize}
                  onChange={(e) =>
                    updateObjectProperty("fontSize", parseInt(e.target.value))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={selectedObject.fill}
                  onChange={(e) => updateObjectProperty("fill", e.target.value)}
                  className="w-full h-8 bg-white/5 border border-white/10 rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateObjectProperty(
                      "fontWeight",
                      selectedObject.fontWeight === "bold" ? "normal" : "bold"
                    )
                  }
                  className={`flex-1 p-2 rounded-lg transition-all ${
                    selectedObject.fontWeight === "bold"
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  <Bold size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() =>
                    updateObjectProperty(
                      "fontStyle",
                      selectedObject.fontStyle === "italic"
                        ? "normal"
                        : "italic"
                    )
                  }
                  className={`flex-1 p-2 rounded-lg transition-all ${
                    selectedObject.fontStyle === "italic"
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  <Italic size={16} className="mx-auto" />
                </button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedObject.isDynamic || false}
                    onChange={(e) => {
                      selectedObject.fabricObject.set(
                        "isDynamic",
                        e.target.checked
                      );
                      fabricCanvasRef.current.renderAll();
                      handleSelection({
                        selected: [selectedObject.fabricObject],
                      });
                    }}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-blue-400">
                      Dynamic Element
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedObject.isDynamic ? "✓ CSV data" : "Fixed text"}
                    </p>
                  </div>
                </label>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-white/10">
            <label className="block text-xs text-gray-400 mb-2">
              Position & Size (mm)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">X:</span> {selectedObject.left}
              </div>
              <div>
                <span className="text-gray-500">Y:</span> {selectedObject.top}
              </div>
              <div>
                <span className="text-gray-500">W:</span> {selectedObject.width}
              </div>
              <div>
                <span className="text-gray-500">H:</span>{" "}
                {selectedObject.height}
              </div>
              {selectedObject.angle !== 0 && (
                <div className="col-span-2">
                  <span className="text-gray-500">Angle:</span>{" "}
                  {Math.round(selectedObject.angle)}°
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricDesigner;
