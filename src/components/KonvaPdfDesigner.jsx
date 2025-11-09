import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Circle,
  Image,
  Transformer,
} from "react-konva";
import jsPDF from "jspdf";
import {
  Type,
  RectangleHorizontal,
  Circle as CircleIcon,
  Image as ImageIcon,
  Trash2,
  Undo,
  Redo,
  Download,
  Eye,
  X,
  Upload,
  FileText,
} from "lucide-react";

// Define initial canvas dimensions
const STAGE_WIDTH = 1000;
const STAGE_HEIGHT = 700;

/**
 * A Canva-like design editor built with React Konva.
 * Allows users to create designs with text, shapes, and images,
 * and export them as a PDF.
 */
const KonvaPdfDesigner = () => {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [batchPreviews, setBatchPreviews] = useState([]);
  const [showBatchPreview, setShowBatchPreview] = useState(false);

  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const layerRef = useRef(null);
  const fileUploadRef = useRef(null);
  const csvUploadRef = useRef(null);

  // Attach transformer to selected node
  useEffect(() => {
    if (transformerRef.current) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]);
      }
      layerRef.current.batchDraw();
    }
  }, [selectedId]);

  // Keyboard event for deleting elements
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" && selectedId) {
        handleDelete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId, elements]);

  /**
   * Saves the current state of elements to the history stack.
   * This is used for undo/redo functionality.
   * @param {Array} newElements - The new array of elements to save.
   */
  const saveHistory = (newElements) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      setElements(history[newStep]);
      setSelectedId(null);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      setElements(history[newStep]);
      setSelectedId(null);
    }
  };

  const handleAddText = () => {
    const newText = {
      id: `text-${elements.length}`,
      type: "text",
      x: 50,
      y: 50,
      text: "New Text",
      fontSize: 30,
      fill: "#000000",
      isDynamic: false,
      dataField: "",
    };
    const newElements = [...elements, newText];
    setElements(newElements);
    saveHistory(newElements);
  };

  const handleAddRect = () => {
    const newRect = {
      id: `rect-${elements.length}`,
      type: "rect",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: "#3b82f6",
      stroke: "#1e40af",
      strokeWidth: 2,
      opacity: 1,
    };
    const newElements = [...elements, newRect];
    setElements(newElements);
    saveHistory(newElements);
  };

  const handleAddCircle = () => {
    const newCircle = {
      id: `circle-${elements.length}`,
      type: "circle",
      x: 150,
      y: 150,
      radius: 50,
      fill: "#10b981",
      stroke: "#047857",
      strokeWidth: 2,
      opacity: 1,
    };
    const newElements = [...elements, newCircle];
    setElements(newElements);
    saveHistory(newElements);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const newImage = {
            id: `image-${elements.length}`,
            type: "image",
            x: 100,
            y: 100,
            image: img,
            width: img.width,
            height: img.height,
          };
          const newElements = [...elements, newImage];
          setElements(newElements);
          saveHistory(newElements);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const newElements = elements.filter((el) => el.id !== selectedId);
    setElements(newElements);
    saveHistory(newElements);
    setSelectedId(null);
  };

  const handlePreview = () => {
    setSelectedId(null);
    setTimeout(() => {
      const stage = stageRef.current;
      if (stage) {
        const dataURL = stage.toDataURL({ pixelRatio: 2 });
        setPreviewUrl(dataURL);
        setShowPreview(true);
      }
    }, 100);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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
        setShowCsvModal(true);
      };
      reader.readAsText(file);
    }
  };

  const generateBatchPDFs = async () => {
    if (csvData.length === 0) {
      alert("Please upload CSV data first");
      return;
    }

    setSelectedId(null);
    const previews = [];

    // Wait for deselection
    await new Promise((resolve) => setTimeout(resolve, 100));

    for (let i = 0; i < csvData.length; i++) {
      const record = csvData[i];
      const stage = stageRef.current;

      // Create a temporary stage with data
      const layer = layerRef.current;
      const originalTexts = [];

      // Store original text values and replace with dynamic data
      elements.forEach((el) => {
        if (el.type === "text" && el.isDynamic && el.dataField) {
          const node = stage.findOne(`#${el.id}`);
          if (node) {
            originalTexts.push({ node, originalText: node.text() });
            const value = record[el.dataField] || el.text;
            node.text(value);
          }
        }
      });

      layer.batchDraw();

      // Generate PDF
      await new Promise((resolve) => setTimeout(resolve, 50));
      const dataURL = stage.toDataURL({ pixelRatio: 2 });

      const pdf = new jsPDF({
        orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
        unit: "px",
        format: [STAGE_WIDTH, STAGE_HEIGHT],
      });

      pdf.addImage(dataURL, "PNG", 0, 0, STAGE_WIDTH, STAGE_HEIGHT);

      previews.push({
        pdf,
        dataURL,
        filename: `certificate_${record.name || record.fullname || i + 1}.pdf`,
        recipient: record,
      });

      // Restore original text
      originalTexts.forEach(({ node, originalText }) => {
        node.text(originalText);
      });
      layer.batchDraw();
    }

    setBatchPreviews(previews);
    setShowBatchPreview(true);
    setShowCsvModal(false);
  };

  const downloadBatchPDF = (pdf, filename) => {
    pdf.save(filename);
  };

  const downloadAllBatchPDFs = () => {
    batchPreviews.forEach(({ pdf, filename }) => {
      pdf.save(filename);
    });
    alert(`Successfully downloaded ${batchPreviews.length} certificate(s)!`);
  };

  const closeBatchPreview = () => {
    setShowBatchPreview(false);
    setBatchPreviews([]);
  };

  const handleExportPDF = () => {
    // Deselect any element to remove transformer from the exported image
    setSelectedId(null);

    // We need to wait for the deselection to apply and transformer to disappear
    setTimeout(() => {
      const stage = stageRef.current;
      if (stage) {
        // Get data URL of the stage content
        const dataURL = stage.toDataURL({ pixelRatio: 2 }); // Higher resolution

        // Create a new jsPDF instance
        const pdf = new jsPDF({
          orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
          unit: "px",
          format: [STAGE_WIDTH, STAGE_HEIGHT],
        });

        // Add the image to the PDF
        pdf.addImage(dataURL, "PNG", 0, 0, STAGE_WIDTH, STAGE_HEIGHT);

        // Download the PDF
        pdf.save("design.pdf");
      }
    }, 100);
  };

  const checkDeselect = (e) => {
    // Deselect when clicking on the stage
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const handleElementChange = (id, newAttrs) => {
    const newElements = elements.slice();
    const index = elements.findIndex((el) => el.id === id);
    if (index !== -1) {
      newElements[index] = { ...newElements[index], ...newAttrs };
      setElements(newElements);
      // Note: For performance, you might want to debounce history saving
      // for frequent updates like dragging.
    }
  };

  const handleDragEnd = (e, id) => {
    const newAttrs = { x: e.target.x(), y: e.target.y() };
    handleElementChange(id, newAttrs);
    saveHistory(
      elements.map((el) => (el.id === id ? { ...el, ...newAttrs } : el))
    );
  };

  const handleTransformEnd = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const newAttrs = {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(node.height() * scaleY),
      rotation: node.rotation(),
    };
    handleElementChange(id, newAttrs);
    saveHistory(
      elements.map((el) => (el.id === id ? { ...el, ...newAttrs } : el))
    );
  };

  const getSelectedElement = () => elements.find((el) => el.id === selectedId);

  const updateSelectedElement = (prop, value) => {
    if (!selectedId) return;
    const newElements = elements.map((el) => {
      if (el.id === selectedId) {
        return { ...el, [prop]: value };
      }
      return el;
    });
    setElements(newElements);
    saveHistory(newElements);
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 text-white">
      {/* Toolbar */}
      <div className="bg-gray-900 p-2 flex items-center gap-2 border-b border-gray-700">
        <button
          onClick={handleAddText}
          className="p-2 hover:bg-gray-700 rounded"
          title="Add Text"
        >
          <Type />
        </button>
        <button
          onClick={handleAddRect}
          className="p-2 hover:bg-gray-700 rounded"
          title="Add Rectangle"
        >
          <RectangleHorizontal />
        </button>
        <button
          onClick={handleAddCircle}
          className="p-2 hover:bg-gray-700 rounded"
          title="Add Circle"
        >
          <CircleIcon />
        </button>
        <button
          onClick={() => fileUploadRef.current.click()}
          className="p-2 hover:bg-gray-700 rounded"
          title="Upload Image"
        >
          <ImageIcon />
        </button>
        <input
          type="file"
          ref={fileUploadRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />
        <div className="w-px h-6 bg-gray-700 mx-2"></div>
        <button
          onClick={() => csvUploadRef.current.click()}
          className="p-2 hover:bg-green-700 bg-green-600 rounded"
          title="Upload CSV for Batch Generation"
        >
          <Upload />
        </button>
        <input
          type="file"
          ref={csvUploadRef}
          onChange={handleCsvUpload}
          className="hidden"
          accept=".csv"
        />
        <div className="w-px h-6 bg-gray-700 mx-2"></div>
        <button
          onClick={handleDelete}
          disabled={!selectedId}
          className="p-2 hover:bg-red-700 rounded disabled:opacity-50"
          title="Delete"
        >
          <Trash2 />
        </button>
        <div className="w-px h-6 bg-gray-700 mx-2"></div>
        <button
          onClick={handleUndo}
          disabled={historyStep === 0}
          className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Undo"
        >
          <Undo />
        </button>
        <button
          onClick={handleRedo}
          disabled={historyStep === history.length - 1}
          className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Redo"
        >
          <Redo />
        </button>
        <div className="flex-grow"></div>
        <button
          onClick={handlePreview}
          className="p-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center gap-2 mr-2"
          title="Preview"
        >
          <Eye /> Preview
        </button>
        <button
          onClick={handleExportPDF}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2"
          title="Export PDF"
        >
          <Download /> Export PDF
        </button>
      </div>

      <div className="flex-1 flex">
        {/* Main Canvas Area */}
        <div className="flex-1 flex items-center justify-center bg-gray-700 p-4">
          <div className="bg-white shadow-lg">
            <Stage
              width={STAGE_WIDTH}
              height={STAGE_HEIGHT}
              onMouseDown={checkDeselect}
              onTouchStart={checkDeselect}
              ref={stageRef}
            >
              <Layer ref={layerRef}>
                {elements.map((el) => {
                  const commonProps = {
                    key: el.id,
                    id: el.id,
                    x: el.x,
                    y: el.y,
                    draggable: true,
                    onClick: () => setSelectedId(el.id),
                    onTap: () => setSelectedId(el.id),
                    onDragEnd: (e) => handleDragEnd(e, el.id),
                    onTransformEnd: (e) => handleTransformEnd(e, el.id),
                  };

                  if (el.type === "rect") {
                    return (
                      <Rect
                        {...commonProps}
                        width={el.width}
                        height={el.height}
                        fill={el.fill}
                        stroke={el.stroke || "#000000"}
                        strokeWidth={el.strokeWidth || 0}
                        opacity={el.opacity !== undefined ? el.opacity : 1}
                        rotation={el.rotation}
                      />
                    );
                  }
                  if (el.type === "circle") {
                    return (
                      <Circle
                        {...commonProps}
                        radius={el.radius}
                        fill={el.fill}
                        stroke={el.stroke || "#000000"}
                        strokeWidth={el.strokeWidth || 0}
                        opacity={el.opacity !== undefined ? el.opacity : 1}
                        rotation={el.rotation}
                      />
                    );
                  }
                  if (el.type === "text") {
                    return (
                      <Text
                        {...commonProps}
                        text={el.text}
                        fontSize={el.fontSize}
                        fill={el.fill}
                        opacity={el.opacity !== undefined ? el.opacity : 1}
                        rotation={el.rotation}
                        onDblClick={(e) => {
                          const textNode = e.target;
                          textNode.hide();
                          transformerRef.current.hide();

                          const textPosition = textNode.absolutePosition();
                          const stageBox = stageRef.current
                            .container()
                            .getBoundingClientRect();

                          const areaPosition = {
                            x: stageBox.left + textPosition.x,
                            y: stageBox.top + textPosition.y,
                          };

                          const textarea = document.createElement("textarea");
                          document.body.appendChild(textarea);

                          textarea.value = textNode.text();
                          textarea.style.position = "absolute";
                          textarea.style.top = areaPosition.y + "px";
                          textarea.style.left = areaPosition.x + "px";
                          textarea.style.width =
                            textNode.width() - textNode.padding() * 2 + "px";
                          textarea.style.height =
                            textNode.height() -
                            textNode.padding() * 2 +
                            5 +
                            "px";
                          textarea.style.fontSize = textNode.fontSize() + "px";
                          textarea.style.border = "none";
                          textarea.style.padding = "0px";
                          textarea.style.margin = "0px";
                          textarea.style.overflow = "hidden";
                          textarea.style.background = "none";
                          textarea.style.outline = "none";
                          textarea.style.resize = "none";
                          textarea.style.lineHeight = textNode.lineHeight();
                          textarea.style.fontFamily = textNode.fontFamily();
                          textarea.style.transformOrigin = "left top";
                          textarea.style.textAlign = textNode.align();
                          textarea.style.color = textNode.fill();
                          let rotation = textNode.rotation();
                          let transform = "";
                          if (rotation) {
                            transform += "rotateZ(" + rotation + "deg)";
                          }
                          textarea.style.transform = transform;
                          textarea.style.height = "auto";
                          textarea.style.height =
                            textarea.scrollHeight + 3 + "px";
                          textarea.focus();

                          function removeTextarea() {
                            textarea.parentNode.removeChild(textarea);
                            window.removeEventListener(
                              "click",
                              handleOutsideClick
                            );
                            textNode.show();
                            transformerRef.current.show();
                            transformerRef.current.forceUpdate();
                            layerRef.current.batchDraw();
                          }

                          textarea.addEventListener("keydown", function (e) {
                            if (e.keyCode === 13 && !e.shiftKey) {
                              handleElementChange(el.id, {
                                text: textarea.value,
                              });
                              saveHistory(
                                elements.map((elem) =>
                                  elem.id === el.id
                                    ? { ...elem, text: textarea.value }
                                    : elem
                                )
                              );
                              removeTextarea();
                            }
                            if (e.keyCode === 27) {
                              removeTextarea();
                            }
                          });

                          function handleOutsideClick(e) {
                            if (e.target !== textarea) {
                              handleElementChange(el.id, {
                                text: textarea.value,
                              });
                              saveHistory(
                                elements.map((elem) =>
                                  elem.id === el.id
                                    ? { ...elem, text: textarea.value }
                                    : elem
                                )
                              );
                              removeTextarea();
                            }
                          }
                          setTimeout(() => {
                            window.addEventListener(
                              "click",
                              handleOutsideClick
                            );
                          });
                        }}
                      />
                    );
                  }
                  if (el.type === "image") {
                    return (
                      <Image
                        {...commonProps}
                        image={el.image}
                        width={el.width}
                        height={el.height}
                        rotation={el.rotation}
                      />
                    );
                  }
                  return null;
                })}
                <Transformer ref={transformerRef} />
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-64 bg-gray-900 p-4 border-l border-gray-700 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">Properties</h3>
          {selectedId && getSelectedElement() ? (
            <div className="space-y-4">
              {/* Fill Color */}
              <div>
                <label className="text-sm text-gray-400 block mb-1">
                  Fill Color
                </label>
                <input
                  type="color"
                  value={getSelectedElement().fill || "#000000"}
                  onChange={(e) =>
                    updateSelectedElement("fill", e.target.value)
                  }
                  className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                />
              </div>

              {/* Opacity for shapes and circles */}
              {(getSelectedElement().type === "rect" ||
                getSelectedElement().type === "circle") && (
                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Opacity:{" "}
                    {Math.round(
                      (getSelectedElement().opacity !== undefined
                        ? getSelectedElement().opacity
                        : 1) * 100
                    )}
                    %
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={
                      getSelectedElement().opacity !== undefined
                        ? getSelectedElement().opacity
                        : 1
                    }
                    onChange={(e) =>
                      updateSelectedElement(
                        "opacity",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </div>
              )}

              {/* Border/Stroke for shapes and circles */}
              {(getSelectedElement().type === "rect" ||
                getSelectedElement().type === "circle") && (
                <>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">
                      Border Color
                    </label>
                    <input
                      type="color"
                      value={getSelectedElement().stroke || "#000000"}
                      onChange={(e) =>
                        updateSelectedElement("stroke", e.target.value)
                      }
                      className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">
                      Border Width
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={getSelectedElement().strokeWidth || 0}
                      onChange={(e) =>
                        updateSelectedElement(
                          "strokeWidth",
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                </>
              )}

              {/* Font Size for text */}
              {getSelectedElement().type === "text" && (
                <>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">
                      Font Size
                    </label>
                    <input
                      type="number"
                      value={getSelectedElement().fontSize}
                      onChange={(e) =>
                        updateSelectedElement(
                          "fontSize",
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>

                  {/* Dynamic Field Checkbox */}
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={getSelectedElement().isDynamic || false}
                        onChange={(e) =>
                          updateSelectedElement("isDynamic", e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <span>Dynamic Field (from CSV)</span>
                    </label>
                  </div>

                  {/* Data Field Input - only show if isDynamic is true */}
                  {getSelectedElement().isDynamic && (
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">
                        CSV Field Name
                      </label>
                      <input
                        type="text"
                        value={getSelectedElement().dataField || ""}
                        onChange={(e) =>
                          updateSelectedElement("dataField", e.target.value)
                        }
                        placeholder="e.g., name, email, course"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the exact column name from your CSV
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">
                      Text Opacity:{" "}
                      {Math.round(
                        (getSelectedElement().opacity !== undefined
                          ? getSelectedElement().opacity
                          : 1) * 100
                      )}
                      %
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={
                        getSelectedElement().opacity !== undefined
                          ? getSelectedElement().opacity
                          : 1
                      }
                      onChange={(e) =>
                        updateSelectedElement(
                          "opacity",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {/* Width and Height for rect and image */}
              {(getSelectedElement().type === "rect" ||
                getSelectedElement().type === "image") && (
                <>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">
                      Width
                    </label>
                    <input
                      type="number"
                      value={Math.round(getSelectedElement().width)}
                      onChange={(e) =>
                        updateSelectedElement(
                          "width",
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      value={Math.round(getSelectedElement().height)}
                      onChange={(e) =>
                        updateSelectedElement(
                          "height",
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                </>
              )}

              {/* Radius for circle */}
              {getSelectedElement().type === "circle" && (
                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Radius
                  </label>
                  <input
                    type="number"
                    value={getSelectedElement().radius}
                    onChange={(e) =>
                      updateSelectedElement(
                        "radius",
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">
              Select an element to see its properties.
            </p>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Design Preview</h2>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-hidden p-4 flex items-center justify-center bg-gray-700">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Design Preview"
                  className="max-w-full max-h-full shadow-2xl"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <button
                onClick={closePreview}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closePreview();
                  handleExportPDF();
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                <Download size={18} />
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">CSV Data Loaded</h2>
              <button
                onClick={() => setShowCsvModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                <p className="text-blue-300 text-sm">
                  <strong>{csvData.length} records</strong> loaded from CSV
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Available fields:{" "}
                  {csvData.length > 0 && Object.keys(csvData[0]).join(", ")}
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                <p className="text-yellow-300 text-sm font-semibold mb-2">
                  📋 How to use dynamic fields:
                </p>
                <ol className="text-gray-300 text-xs space-y-1 ml-4 list-decimal">
                  <li>Select a text element on the canvas</li>
                  <li>
                    Check "Dynamic Field (from CSV)" in the properties panel
                  </li>
                  <li>Enter the CSV column name (e.g., name, email, course)</li>
                  <li>
                    The text will be replaced with data from each row when
                    generating batch PDFs
                  </li>
                </ol>
              </div>

              <div className="max-h-60 overflow-auto bg-gray-900 rounded-lg p-3">
                <table className="w-full text-xs">
                  <thead className="text-gray-400 border-b border-gray-700">
                    <tr>
                      {csvData.length > 0 &&
                        Object.keys(csvData[0]).map((key) => (
                          <th key={key} className="text-left p-2">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {csvData.slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="p-2">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 5 && (
                  <p className="text-gray-500 text-xs mt-2 text-center">
                    ... and {csvData.length - 5} more rows
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Close
              </button>
              <button
                onClick={generateBatchPDFs}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
              >
                <FileText size={18} />
                Generate {csvData.length} Certificates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Preview Modal */}
      {showBatchPreview && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Batch Certificates Generated
                </h2>
                <p className="text-sm text-gray-400">
                  {batchPreviews.length} certificates ready to download
                </p>
              </div>
              <button
                onClick={closeBatchPreview}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-4">
              <div className="h-full overflow-y-auto space-y-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                  <p className="text-green-300 text-sm">
                    <strong>{batchPreviews.length} certificates</strong>{" "}
                    generated successfully and ready to download
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {batchPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
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
                      </div>
                      <img
                        src={preview.dataURL}
                        alt={`Certificate ${index + 1}`}
                        className="w-full h-32 object-contain bg-white rounded mb-3"
                      />
                      <button
                        onClick={() =>
                          downloadBatchPDF(preview.pdf, preview.filename)
                        }
                        className="w-full flex items-center justify-center gap-2 p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <button
                onClick={closeBatchPreview}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Close
              </button>
              <button
                onClick={downloadAllBatchPDFs}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                <Download size={18} />
                Download All ({batchPreviews.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KonvaPdfDesigner;
