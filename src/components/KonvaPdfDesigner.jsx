import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Circle,
  Image,
  Transformer,
  Line,
  Star,
  Arrow,
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
  Minus,
  Smile,
  Star as StarIcon,
  MoveUp,
  MoveDown,
  Copy,
  Lock,
  Unlock,
  Pen,
  ArrowRight,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Database,
} from "lucide-react";
import useWalletStore from "../store/wallet";
import CreditConfirmationModal from "./CreditConfirmationModal";
import { CREDIT_COSTS } from "../services/api";

// Define initial canvas dimensions
const STAGE_WIDTH = 1000;
const STAGE_HEIGHT = 700;

/**
 * A Canva-like design editor built with React Konva.
 * Allows users to create designs with text, shapes, and images,
 * and export them as a PDF.
 */
const KonvaPdfDesigner = ({ template: initialTemplate, onTemplateChange }) => {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvFields, setCsvFields] = useState([]); // Store CSV field names
  const [showCsvFieldsPanel, setShowCsvFieldsPanel] = useState(false); // Show fields panel after CSV upload
  const [batchPreviews, setBatchPreviews] = useState([]);
  const [showBatchPreview, setShowBatchPreview] = useState(false);
  const [showBatchPreviewBeforeGenerate, setShowBatchPreviewBeforeGenerate] =
    useState(false);
  const [previewSamples, setPreviewSamples] = useState([]);
  const [draggedField, setDraggedField] = useState(null); // Track field being dragged
  const [previewRecordIndex, setPreviewRecordIndex] = useState(0); // Track which CSV record is being previewed

  // Multi-select states
  const [selectedIds, setSelectedIds] = useState([]); // Array of selected IDs

  // New states for advanced features
  const [drawingMode, setDrawingMode] = useState(null); // 'pen', 'line', 'arrow'
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false); // Export dropdown menu

  // Credit system states
  const { credits, fetchCredits, updateCredits } = useWalletStore();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [pendingExportAction, setPendingExportAction] = useState(null);
  const [creditCheckLoading, setCreditCheckLoading] = useState(false);

  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const layerRef = useRef(null);
  const fileUploadRef = useRef(null);
  const csvUploadRef = useRef(null);
  const isLoadingTemplate = useRef(false); // Track if we're loading a template
  const lastSyncedElements = useRef(null); // Track last synced elements to prevent loops

  // Convert Konva elements back to template format (pixels to mm)
  const convertToTemplateFormat = (konvaElements) => {
    const pixelToMmX = 297 / STAGE_WIDTH; // ~0.297
    const pixelToMmY = 210 / STAGE_HEIGHT; // ~0.3

    return konvaElements.map((el) => {
      const baseElement = {
        id: el.id,
        type: el.type,
        x: (el.x || 0) * pixelToMmX,
        y: (el.y || 0) * pixelToMmY,
        rotation: el.rotation || 0,
        isDynamic: el.isDynamic || false,
        dataField: el.dataField || null,
      };

      if (el.type === "text") {
        return {
          ...baseElement,
          text: el.text,
          fontSize: (el.fontSize || 30) / 1.5, // Unscale font size
          font: el.fontFamily || "Arial",
          fontFamily: el.fontFamily || "Arial",
          color: el.fill || "#000000",
          fill: el.fill || "#000000",
          fontStyle: el.fontStyle || "normal",
          bold: el.fontStyle === "bold",
          italic: el.textDecoration === "italic",
          align: el.align || "left",
          width: el.width ? el.width * pixelToMmX : 200,
        };
      } else if (el.type === "image") {
        return {
          ...baseElement,
          src: el.src,
          width: (el.width || 100) * pixelToMmX,
          height: (el.height || 100) * pixelToMmY,
        };
      } else if (el.type === "rect") {
        return {
          ...baseElement,
          type: "rectangle",
          width: (el.width || 100) * pixelToMmX,
          height: (el.height || 50) * pixelToMmY,
          fillColor: el.fill || "transparent",
          fill: el.fill || "transparent",
          borderColor: el.stroke || "#000000",
          stroke: el.stroke || "#000000",
          borderWidth: (el.strokeWidth || 2) / 2,
        };
      } else if (el.type === "circle") {
        return {
          ...baseElement,
          radius: (el.radius || 50) * pixelToMmX,
          fillColor: el.fill || "transparent",
          fill: el.fill || "transparent",
          borderColor: el.stroke || "#000000",
          stroke: el.stroke || "#000000",
          borderWidth: (el.strokeWidth || 2) / 2,
        };
      } else if (el.type === "star") {
        return {
          ...baseElement,
          numPoints: el.numPoints || 5,
          innerRadius: (el.innerRadius || 30) * pixelToMmX,
          outerRadius: (el.outerRadius || 60) * pixelToMmX,
          fillColor: el.fill || "transparent",
          fill: el.fill || "transparent",
          borderColor: el.stroke || "#000000",
          stroke: el.stroke || "#000000",
          borderWidth: (el.strokeWidth || 2) / 2,
        };
      } else if (el.type === "line" || el.type === "arrow") {
        return {
          ...baseElement,
          points: el.points
            ? el.points.map((p, i) =>
                i % 2 === 0 ? p * pixelToMmX : p * pixelToMmY
              )
            : [],
          stroke: el.stroke || "#000000",
          strokeWidth: (el.strokeWidth || 2) / 2,
          lineCap: el.lineCap,
          lineJoin: el.lineJoin,
          pointerLength: el.pointerLength,
          pointerWidth: el.pointerWidth,
        };
      }
      return baseElement;
    });
  };

  // Sync elements with parent component whenever they change
  useEffect(() => {
    // Don't sync if we're currently loading a template
    if (isLoadingTemplate.current) {
      return;
    }

    // Don't sync if elements haven't actually changed
    const elementsStr = JSON.stringify(elements);
    if (lastSyncedElements.current === elementsStr) {
      return;
    }

    // Only sync if we have elements and onTemplateChange callback
    if (onTemplateChange && elements.length > 0) {
      const templateElements = convertToTemplateFormat(elements);
      onTemplateChange({
        name: initialTemplate?.name || "Konva Design",
        orientation: "landscape",
        format: "a4",
        backgroundColor: "#ffffff",
        elements: templateElements,
      });
      lastSyncedElements.current = elementsStr;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]); // Only sync when elements change (onTemplateChange is stable)

  // Load template when initialTemplate prop changes
  useEffect(() => {
    if (
      initialTemplate &&
      initialTemplate.elements &&
      initialTemplate.elements.length > 0
    ) {
      // Set loading flag to prevent sync during load
      isLoadingTemplate.current = true;

      // Convert template elements to Konva format
      // Templates store positions in mm, Konva uses pixels
      // A4 landscape: 297mm x 210mm -> ~1000px x 700px canvas
      const mmToPixelX = STAGE_WIDTH / 297; // ~3.37
      const mmToPixelY = STAGE_HEIGHT / 210; // ~3.33

      const konvaElements = initialTemplate.elements
        .map((el, index) => {
          const baseElement = {
            id: el.id || `element-${Date.now()}-${index}`,
            x: (el.x || 0) * mmToPixelX,
            y: (el.y || 0) * mmToPixelY,
            rotation: el.rotation || 0,
            isDynamic: el.isDynamic || false,
            dataField: el.dataField || null,
          };

          if (el.type === "text") {
            return {
              ...baseElement,
              type: "text",
              text: el.text || "Text",
              fontSize: (el.fontSize || 16) * 1.5, // Scale font size
              fontFamily: el.font || el.fontFamily || "Arial",
              fill: el.color || el.fill || "#000000",
              fontStyle: el.fontStyle || (el.bold ? "bold" : "normal"),
              textDecoration: el.italic ? "italic" : "",
              align: el.align || "left",
              width: el.width ? el.width * mmToPixelX : 200,
            };
          } else if (el.type === "image") {
            return {
              ...baseElement,
              type: "image",
              src: el.src,
              width: (el.width || 100) * mmToPixelX,
              height: (el.height || 100) * mmToPixelY,
            };
          } else if (el.type === "rectangle") {
            return {
              ...baseElement,
              type: "rect",
              width: (el.width || 100) * mmToPixelX,
              height: (el.height || 50) * mmToPixelY,
              fill: el.fillColor || el.fill || "transparent",
              stroke: el.borderColor || el.stroke || "#000000",
              strokeWidth: (el.borderWidth || 1) * 2,
            };
          } else if (el.type === "circle") {
            return {
              ...baseElement,
              type: "circle",
              radius: (el.radius || 50) * mmToPixelX,
              fill: el.fillColor || el.fill || "transparent",
              stroke: el.borderColor || el.stroke || "#000000",
              strokeWidth: (el.borderWidth || 1) * 2,
            };
          } else if (el.type === "star") {
            return {
              ...baseElement,
              type: "star",
              numPoints: el.numPoints || 5,
              innerRadius: (el.innerRadius || 30) * mmToPixelX,
              outerRadius: (el.outerRadius || 60) * mmToPixelX,
              fill: el.fillColor || el.fill || "transparent",
              stroke: el.borderColor || el.stroke || "#000000",
              strokeWidth: (el.borderWidth || 1) * 2,
            };
          } else if (el.type === "line") {
            return {
              ...baseElement,
              type: "line",
              points: el.points
                ? el.points.map((p, i) =>
                    i % 2 === 0 ? p * mmToPixelX : p * mmToPixelY
                  )
                : [0, 0, 100 * mmToPixelX, 0],
              stroke: el.stroke || el.color || "#000000",
              strokeWidth: (el.strokeWidth || el.thickness || 1) * 2,
              lineCap: el.lineCap || "round",
              lineJoin: el.lineJoin || "round",
            };
          } else if (el.type === "arrow") {
            return {
              ...baseElement,
              type: "arrow",
              points: el.points
                ? el.points.map((p, i) =>
                    i % 2 === 0 ? p * mmToPixelX : p * mmToPixelY
                  )
                : [0, 0, 100 * mmToPixelX, 0],
              stroke: el.stroke || "#000000",
              strokeWidth: (el.strokeWidth || 1) * 2,
              fill: el.fill || el.stroke || "#000000",
              pointerLength: el.pointerLength || 10,
              pointerWidth: el.pointerWidth || 10,
            };
          }
          return null;
        })
        .filter(Boolean);

      setElements(konvaElements);
      setHistory([konvaElements]);
      setHistoryStep(0);

      // Reset loading flag after a short delay to allow state to settle
      setTimeout(() => {
        isLoadingTemplate.current = false;
        // Update lastSyncedElements to current state to prevent immediate sync
        lastSyncedElements.current = JSON.stringify(konvaElements);
      }, 100);
    }
  }, [initialTemplate]);

  // Attach transformer to selected node
  useEffect(() => {
    if (transformerRef.current) {
      const stage = stageRef.current;

      // Handle multi-select
      if (selectedIds.length > 0) {
        const nodes = selectedIds
          .map((id) => stage.findOne(`#${id}`))
          .filter((node) => node); // Filter out null nodes
        transformerRef.current.nodes(nodes);
      } else if (selectedId) {
        // Single select
        const selectedNode = stage.findOne(`#${selectedId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
        } else {
          transformerRef.current.nodes([]);
        }
      } else {
        transformerRef.current.nodes([]);
      }

      layerRef.current.batchDraw();
    }
  }, [selectedId, selectedIds]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, elements]); // handleDelete uses elements, so it's included

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
      fontFamily: "Arial",
      align: "left",
      width: 200, // Default width for proper alignment
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

  const handleAddStar = () => {
    const newStar = {
      id: `star-${elements.length}`,
      type: "star",
      x: 200,
      y: 200,
      numPoints: 5,
      innerRadius: 30,
      outerRadius: 60,
      fill: "#fbbf24",
      stroke: "#f59e0b",
      strokeWidth: 2,
      opacity: 1,
    };
    const newElements = [...elements, newStar];
    setElements(newElements);
    saveHistory(newElements);
  };

  const handleAddLine = () => {
    const newLine = {
      id: `line-${elements.length}`,
      type: "line",
      points: [50, 50, 250, 50],
      stroke: "#000000",
      strokeWidth: 3,
      lineCap: "round",
      lineJoin: "round",
    };
    const newElements = [...elements, newLine];
    setElements(newElements);
    saveHistory(newElements);
  };

  const handleAddArrow = () => {
    const newArrow = {
      id: `arrow-${elements.length}`,
      type: "arrow",
      points: [50, 100, 250, 100],
      stroke: "#ef4444",
      strokeWidth: 3,
      fill: "#ef4444",
      pointerLength: 10,
      pointerWidth: 10,
    };
    const newElements = [...elements, newArrow];
    setElements(newElements);
    saveHistory(newElements);
  };

  const handleAddEmoji = (emoji) => {
    const newText = {
      id: `emoji-${elements.length}`,
      type: "text",
      x: 100,
      y: 100,
      text: emoji,
      fontSize: 48,
      fill: "#000000",
      isDynamic: false,
      dataField: "",
    };
    const newElements = [...elements, newText];
    setElements(newElements);
    saveHistory(newElements);
    setShowEmojiPicker(false);
  };

  const handleDuplicateElement = () => {
    if (!selectedId) return;
    const elementToDuplicate = elements.find((el) => el.id === selectedId);
    if (elementToDuplicate) {
      const newElement = {
        ...elementToDuplicate,
        id: `${elementToDuplicate.type}-${Date.now()}`,
        x: elementToDuplicate.x + 20,
        y: elementToDuplicate.y + 20,
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      saveHistory(newElements);
      setSelectedId(newElement.id);
    }
  };

  const handleBringToFront = () => {
    if (!selectedId) return;
    const index = elements.findIndex((el) => el.id === selectedId);
    if (index !== -1 && index < elements.length - 1) {
      const newElements = [...elements];
      const [element] = newElements.splice(index, 1);
      newElements.push(element);
      setElements(newElements);
      saveHistory(newElements);
    }
  };

  const handleSendToBack = () => {
    if (!selectedId) return;
    const index = elements.findIndex((el) => el.id === selectedId);
    if (index !== -1 && index > 0) {
      const newElements = [...elements];
      const [element] = newElements.splice(index, 1);
      newElements.unshift(element);
      setElements(newElements);
      saveHistory(newElements);
    }
  };

  const handleToggleLock = () => {
    if (!selectedId) return;
    const newElements = elements.map((el) =>
      el.id === selectedId ? { ...el, locked: !el.locked } : el
    );
    setElements(newElements);
    saveHistory(newElements);
  };

  const handleMouseDown = (e) => {
    if (drawingMode === "pen") {
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      setCurrentLine({
        id: `pen-${Date.now()}`,
        type: "line",
        points: [pos.x, pos.y],
        stroke: "#000000",
        strokeWidth: 3,
        lineCap: "round",
        lineJoin: "round",
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || drawingMode !== "pen") return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const newLine = {
      ...currentLine,
      points: [...currentLine.points, point.x, point.y],
    };
    setCurrentLine(newLine);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentLine) {
      const newElements = [...elements, currentLine];
      setElements(newElements);
      saveHistory(newElements);
      setCurrentLine(null);
    }
    setIsDrawing(false);
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
    // Delete all selected elements (multi-select or single)
    const idsToDelete =
      selectedIds.length > 0 ? selectedIds : selectedId ? [selectedId] : [];
    if (idsToDelete.length === 0) return;

    const newElements = elements.filter((el) => !idsToDelete.includes(el.id));
    setElements(newElements);
    saveHistory(newElements);
    setSelectedId(null);
    setSelectedIds([]);
  };

  const handlePreview = () => {
    setSelectedId(null);
    setSelectedIds([]);
    setPreviewRecordIndex(0); // Start with first record
    generatePreviewWithRecord(0);
  };

  const generatePreviewWithRecord = async (recordIndex) => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!stage || !layer) return;

    // If CSV data exists, show preview with specified record's data
    if (csvData.length > 0 && recordIndex < csvData.length) {
      const record = csvData[recordIndex];

      // Store original text values
      const originalTexts = {};

      // Temporarily replace dynamic fields with actual data
      elements.forEach((el) => {
        if (el.type === "text" && el.isDynamic && el.dataField) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            originalTexts[el.id] = textNode.text();
            const value = record[el.dataField] || `{{${el.dataField}}}`;
            textNode.text(value);
          }
        }
      });

      layer.batchDraw();

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate preview with white background
      const dataURL = stage.toDataURL({
        pixelRatio: 2,
        mimeType: "image/png",
        quality: 1,
        backgroundColor: "#ffffff", // Add white background
      });
      setPreviewUrl(dataURL);
      setShowPreview(true);

      // Restore original text
      elements.forEach((el) => {
        if (originalTexts[el.id]) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            textNode.text(originalTexts[el.id]);
          }
        }
      });

      layer.batchDraw();
    } else {
      // No CSV data, show as-is with white background
      const dataURL = stage.toDataURL({
        pixelRatio: 2,
        mimeType: "image/png",
        quality: 1,
        backgroundColor: "#ffffff", // Add white background
      });
      setPreviewUrl(dataURL);
      setShowPreview(true);
    }
  };

  const handlePreviewNextRecord = () => {
    const nextIndex = Math.min(previewRecordIndex + 1, csvData.length - 1);
    setPreviewRecordIndex(nextIndex);
    generatePreviewWithRecord(nextIndex);
  };

  const handlePreviewPrevRecord = () => {
    const prevIndex = Math.max(previewRecordIndex - 1, 0);
    setPreviewRecordIndex(prevIndex);
    generatePreviewWithRecord(prevIndex);
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
        setCsvFields(headers); // Store CSV field names
        setShowCsvFieldsPanel(true); // Show fields panel for drag-and-drop
        setShowCsvModal(true);
      };
      reader.readAsText(file);
    }
  };

  const handlePreviewBatch = async () => {
    if (csvData.length === 0) {
      alert("Please upload CSV data first");
      return;
    }

    // Check if there are any dynamic fields assigned
    const hasDynamicFields = elements.some(
      (el) => el.type === "text" && el.isDynamic && el.dataField
    );

    if (!hasDynamicFields) {
      const proceed = window.confirm(
        "⚠️ No dynamic fields assigned!\n\nYou haven't assigned any CSV fields to text elements.\n\n" +
          "To use CSV data:\n1. Select a text element\n2. Check 'Dynamic Field (from CSV)'\n3. Enter the CSV field name\n\n" +
          "Continue anyway to preview?"
      );
      if (!proceed) return;
    }

    setSelectedId(null);
    const samples = [];

    // Preview first 3 records (or all if less than 3)
    const samplesToPreview = Math.min(csvData.length, 3);

    await new Promise((resolve) => setTimeout(resolve, 100));

    for (let i = 0; i < samplesToPreview; i++) {
      const record = csvData[i];
      const stage = stageRef.current;
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
      await new Promise((resolve) => setTimeout(resolve, 50));
      const dataURL = stage.toDataURL({ pixelRatio: 2 });

      samples.push({
        dataURL,
        recipient: record,
        recipientNumber: i + 1,
      });

      // Restore original text
      originalTexts.forEach(({ node, originalText }) => {
        node.text(originalText);
      });
      layer.batchDraw();
    }

    setPreviewSamples(samples);
    setShowBatchPreviewBeforeGenerate(true);
    setShowCsvModal(false);
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

  // Credit system check function
  const checkCreditsAndExecute = async (operation, count, exportFunction) => {
    setCreditCheckLoading(true);

    try {
      // Calculate cost
      const cost = CREDIT_COSTS[operation] * count;

      // Check if sufficient credits
      if (credits < cost) {
        setShowCreditModal(true);
        setPendingExportAction({ operation, count, cost });
        return;
      }

      // Show confirmation modal
      setPendingExportAction({ operation, count, cost, exportFunction });
      setShowCreditModal(true);
    } catch (error) {
      console.error("Credit check failed:", error);
      alert("Failed to check credits. Please try again.");
    } finally {
      setCreditCheckLoading(false);
    }
  };

  // Handle credit modal confirmation
  const handleCreditConfirmation = async () => {
    if (!pendingExportAction || !pendingExportAction.exportFunction) return;

    setCreditCheckLoading(true);
    setShowCreditModal(false);

    try {
      // Execute the export function
      await pendingExportAction.exportFunction();

      // Update credits locally (backend should also update)
      const newCredits = credits - pendingExportAction.cost;
      updateCredits(newCredits);

      // Fetch latest balance from server
      await fetchCredits();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Credits were not deducted.");
    } finally {
      setCreditCheckLoading(false);
      setPendingExportAction(null);
    }
  };

  const handleExportPDF = () => {
    // Deselect any element to remove transformer from the exported image
    setSelectedId(null);
    setSelectedIds([]);

    // We need to wait for the deselection to apply and transformer to disappear
    setTimeout(() => {
      const stage = stageRef.current;
      if (stage) {
        // Get data URL of the stage content
        const dataURL = stage.toDataURL({
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });

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

  const handleExportPreviewedPDF = async () => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!stage || !layer) return;

    // If CSV data exists, export with the current record's data
    if (csvData.length > 0 && previewRecordIndex < csvData.length) {
      const record = csvData[previewRecordIndex];

      // Store original text values
      const originalTexts = {};

      // Temporarily replace dynamic fields with actual data
      elements.forEach((el) => {
        if (el.type === "text" && el.isDynamic && el.dataField) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            originalTexts[el.id] = textNode.text();
            const value = record[el.dataField] || `{{${el.dataField}}}`;
            textNode.text(value);
          }
        }
      });

      layer.batchDraw();

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate PDF with actual data
      const dataURL = stage.toDataURL({
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
        unit: "px",
        format: [STAGE_WIDTH, STAGE_HEIGHT],
      });

      pdf.addImage(dataURL, "PNG", 0, 0, STAGE_WIDTH, STAGE_HEIGHT);

      // Generate filename from record data
      const recordName =
        record.name || record.Name || `record_${previewRecordIndex + 1}`;
      pdf.save(`certificate_${recordName.replace(/\s+/g, "_")}.pdf`);

      // Restore original text
      elements.forEach((el) => {
        if (originalTexts[el.id]) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            textNode.text(originalTexts[el.id]);
          }
        }
      });

      layer.batchDraw();
    } else {
      // No CSV data, export as-is
      handleExportPDF();
    }
  };

  const handleExportAllPDFs = async () => {
    if (csvData.length === 0) {
      alert("No CSV data to export");
      return;
    }

    const confirmExport = window.confirm(
      `This will generate ${csvData.length} PDF files. Continue?`
    );

    if (!confirmExport) return;

    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!stage || !layer) return;

    // Close preview and show progress
    closePreview();

    let successCount = 0;

    for (let i = 0; i < csvData.length; i++) {
      const record = csvData[i];

      // Store original text values
      const originalTexts = {};

      // Temporarily replace dynamic fields with actual data
      elements.forEach((el) => {
        if (el.type === "text" && el.isDynamic && el.dataField) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            originalTexts[el.id] = textNode.text();
            const value = record[el.dataField] || `{{${el.dataField}}}`;
            textNode.text(value);
          }
        }
      });

      layer.batchDraw();

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate PDF
      const dataURL = stage.toDataURL({
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
        unit: "px",
        format: [STAGE_WIDTH, STAGE_HEIGHT],
      });

      pdf.addImage(dataURL, "PNG", 0, 0, STAGE_WIDTH, STAGE_HEIGHT);

      // Generate filename from record data
      const recordName = record.name || record.Name || `record_${i + 1}`;
      pdf.save(`certificate_${recordName.replace(/\s+/g, "_")}.pdf`);

      // Restore original text
      elements.forEach((el) => {
        if (originalTexts[el.id]) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            textNode.text(originalTexts[el.id]);
          }
        }
      });

      layer.batchDraw();
      successCount++;

      // Small delay between downloads to prevent browser blocking
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    alert(`✓ Successfully generated ${successCount} PDF certificates!`);
  };

  const handleExportAllAsSinglePDF = async () => {
    if (csvData.length === 0) {
      alert("No CSV data to export");
      return;
    }

    const confirmExport = window.confirm(
      `This will generate 1 PDF file with ${csvData.length} pages. Continue?`
    );

    if (!confirmExport) return;

    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!stage || !layer) return;

    // Close preview and show progress
    closePreview();

    // Create a single PDF document
    const pdf = new jsPDF({
      orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
      unit: "px",
      format: [STAGE_WIDTH, STAGE_HEIGHT],
    });

    for (let i = 0; i < csvData.length; i++) {
      const record = csvData[i];

      // Store original text values
      const originalTexts = {};

      // Temporarily replace dynamic fields with actual data
      elements.forEach((el) => {
        if (el.type === "text" && el.isDynamic && el.dataField) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            originalTexts[el.id] = textNode.text();
            const value = record[el.dataField] || `{{${el.dataField}}}`;
            textNode.text(value);
          }
        }
      });

      layer.batchDraw();

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate image
      const dataURL = stage.toDataURL({
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Add new page if not the first page
      if (i > 0) {
        pdf.addPage();
      }

      // Add the image to the current page
      pdf.addImage(dataURL, "PNG", 0, 0, STAGE_WIDTH, STAGE_HEIGHT);

      // Restore original text
      elements.forEach((el) => {
        if (originalTexts[el.id]) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            textNode.text(originalTexts[el.id]);
          }
        }
      });

      layer.batchDraw();

      // Small delay between pages
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Download the single multi-page PDF
    pdf.save(`certificates_all_${csvData.length}_pages.pdf`);
    alert(`✓ Successfully generated 1 PDF with ${csvData.length} pages!`);
  };

  const checkDeselect = (e) => {
    // Deselect when clicking on the stage
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
      setSelectedIds([]);
    }
  };

  const handleElementClick = (e, elementId) => {
    // Check if Ctrl (Windows/Linux) or Cmd (Mac) is pressed
    const isMultiSelect = e.evt.ctrlKey || e.evt.metaKey;

    if (isMultiSelect) {
      // Multi-select mode
      if (selectedIds.includes(elementId)) {
        // Remove from selection
        setSelectedIds(selectedIds.filter((id) => id !== elementId));
        if (selectedId === elementId) {
          setSelectedId(selectedIds[0] || null);
        }
      } else {
        // Add to selection
        setSelectedIds([...selectedIds, elementId]);
        setSelectedId(elementId);
      }
    } else {
      // Single select mode
      setSelectedId(elementId);
      setSelectedIds([elementId]);
    }
  };

  // CSV Field Drag and Drop Handlers
  const handleFieldDragStart = (e, field) => {
    setDraggedField(field);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleFieldDragEnd = () => {
    setDraggedField(null);
  };

  const handleStageDragOver = (e) => {
    if (draggedField) {
      e.preventDefault(); // Allow drop
    }
  };

  const handleStageDropField = (e) => {
    if (!draggedField) return;

    e.preventDefault();

    // Get the stage and its bounding box
    const stage = stageRef.current;
    if (!stage) return;

    const stageBox = stage.container().getBoundingClientRect();

    // Calculate position relative to stage
    const x = e.clientX - stageBox.left;
    const y = e.clientY - stageBox.top;

    // Make sure the drop is within stage bounds
    if (x >= 0 && x <= STAGE_WIDTH && y >= 0 && y <= STAGE_HEIGHT) {
      // Create a new text element with the CSV field assigned
      const newElement = {
        id: Date.now().toString(),
        type: "text",
        text: `{{${draggedField}}}`, // Display placeholder
        x: x,
        y: y,
        fontSize: 30,
        fill: "#000000",
        fontFamily: "Arial",
        align: "center", // Default to center for dynamic fields
        width: 300, // Width needed for alignment to work
        isDynamic: true,
        dataField: draggedField,
      };

      const newElements = [...elements, newElement];
      setElements(newElements);
      saveHistory(newElements);
      setSelectedId(newElement.id);
      setDraggedField(null);
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
          onClick={handleAddStar}
          className="p-2 hover:bg-gray-700 rounded"
          title="Add Star"
        >
          <StarIcon />
        </button>
        <button
          onClick={handleAddLine}
          className="p-2 hover:bg-gray-700 rounded"
          title="Add Line"
        >
          <Minus />
        </button>
        <button
          onClick={handleAddArrow}
          className="p-2 hover:bg-gray-700 rounded"
          title="Add Arrow"
        >
          <ArrowRight />
        </button>
        <button
          onClick={() => {
            setDrawingMode(drawingMode === "pen" ? null : "pen");
            setSelectedId(null);
          }}
          className={`p-2 hover:bg-gray-700 rounded ${
            drawingMode === "pen" ? "bg-blue-600" : ""
          }`}
          title="Freeform Drawing (Pen)"
        >
          <Pen />
        </button>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 hover:bg-gray-700 rounded relative"
          title="Add Emoji"
        >
          <Smile />
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
        {/* Element Controls */}
        <button
          onClick={handleDuplicateElement}
          disabled={!selectedId}
          className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Duplicate"
        >
          <Copy />
        </button>
        <button
          onClick={handleBringToFront}
          disabled={!selectedId}
          className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Bring to Front"
        >
          <MoveUp />
        </button>
        <button
          onClick={handleSendToBack}
          disabled={!selectedId}
          className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Send to Back"
        >
          <MoveDown />
        </button>
        <button
          onClick={handleToggleLock}
          disabled={!selectedId}
          className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Lock/Unlock"
        >
          {selectedId && elements.find((el) => el.id === selectedId)?.locked ? (
            <Lock />
          ) : (
            <Unlock />
          )}
        </button>
        <div className="w-px h-6 bg-gray-700 mx-2"></div>
        <button
          onClick={() => csvUploadRef.current.click()}
          className={`p-2 rounded relative ${
            csvData.length > 0
              ? "bg-green-600 hover:bg-green-700"
              : "hover:bg-green-700 bg-green-600"
          }`}
          title="Upload CSV for Batch Generation"
        >
          <Upload />
          {csvData.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {csvData.length}
            </span>
          )}
        </button>
        {csvData.length > 0 && (
          <button
            onClick={() => setShowCsvFieldsPanel(!showCsvFieldsPanel)}
            className={`p-2 rounded ${
              showCsvFieldsPanel ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
            title="Toggle CSV Fields Panel"
          >
            <Database />
          </button>
        )}
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

        {/* Export PDF Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2"
            title="Export PDF Options"
          >
            <Download /> Export PDF
          </button>

          {showExportMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowExportMenu(false)}
              />

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-20 overflow-hidden">
                {csvData.length > 0 ? (
                  <>
                    <div className="px-4 py-2 bg-gray-700 border-b border-gray-600">
                      <p className="text-xs text-gray-300 font-semibold">
                        Export Options ({csvData.length} records)
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        setShowExportMenu(false);
                        await checkCreditsAndExecute(
                          "generatePDF",
                          csvData.length,
                          handleExportAllPDFs
                        );
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-start gap-3 border-b border-gray-700"
                    >
                      <Download
                        size={18}
                        className="text-green-400 mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-white font-medium text-sm">
                          Separate Files (
                          {CREDIT_COSTS.generatePDF * csvData.length} credits)
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {csvData.length} individual PDF files
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={async () => {
                        setShowExportMenu(false);
                        await checkCreditsAndExecute(
                          "generatePDF",
                          csvData.length,
                          handleExportAllAsSinglePDF
                        );
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-start gap-3"
                    >
                      <Download
                        size={18}
                        className="text-purple-400 mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-white font-medium text-sm">
                          Single File (
                          {CREDIT_COSTS.generatePDF * csvData.length} credits)
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          1 PDF with {csvData.length} pages
                        </p>
                      </div>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      checkCreditsAndExecute("generatePDF", 1, () => {
                        handleExportPDF();
                      });
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-start gap-3"
                  >
                    <Download
                      size={18}
                      className="text-blue-400 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">
                        Export Template ({CREDIT_COSTS.generatePDF} credits)
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Download current design as PDF
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Canvas Area */}
        <div
          className="flex-1 flex items-center justify-center bg-gray-700 p-4"
          onDragOver={handleStageDragOver}
          onDrop={handleStageDropField}
        >
          <div className="bg-white shadow-lg">
            <Stage
              width={STAGE_WIDTH}
              height={STAGE_HEIGHT}
              onMouseDown={(e) => {
                checkDeselect(e);
                handleMouseDown(e);
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
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
                    draggable: !el.locked,
                    onClick: (e) => handleElementClick(e, el.id),
                    onTap: (e) => handleElementClick(e, el.id),
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
                        fontFamily={el.fontFamily || "Arial"}
                        fontStyle={el.fontStyle || "normal"}
                        textDecoration={el.textDecoration || ""}
                        align={el.align || "left"}
                        fill={el.fill}
                        opacity={el.opacity !== undefined ? el.opacity : 1}
                        rotation={el.rotation}
                        width={el.width} // Important for alignment
                        onDblClick={(e) => {
                          const textNode = e.target;
                          const layer = layerRef.current;

                          // Store original position
                          const originalX = textNode.x();
                          const originalY = textNode.y();

                          textNode.hide();
                          transformerRef.current.hide();
                          layer.batchDraw();

                          // Get the absolute position of the text node on the screen
                          const textPosition = textNode.absolutePosition();
                          const stageBox = stageRef.current
                            .container()
                            .getBoundingClientRect();

                          // Calculate the exact screen position
                          const areaPosition = {
                            x: stageBox.left + textPosition.x,
                            y: stageBox.top + textPosition.y,
                          };

                          const textarea = document.createElement("textarea");
                          document.body.appendChild(textarea);

                          // Set initial value and basic styles
                          textarea.value = textNode.text();
                          textarea.style.position = "absolute";
                          textarea.style.top = areaPosition.y + "px";
                          textarea.style.left = areaPosition.x + "px";

                          // Set minimum width based on text node
                          const minWidth = Math.max(
                            textNode.width() || 200,
                            100
                          );
                          textarea.style.width = minWidth + "px";
                          textarea.style.minHeight = textNode.fontSize() + "px";

                          textarea.style.fontSize = textNode.fontSize() + "px";
                          textarea.style.fontFamily =
                            textNode.fontFamily() || "Arial";
                          textarea.style.fontWeight =
                            textNode.fontStyle() === "bold" ? "bold" : "normal";
                          textarea.style.fontStyle =
                            textNode.textDecoration() === "italic"
                              ? "italic"
                              : "normal";
                          textarea.style.textAlign = textNode.align() || "left";
                          textarea.style.color = textNode.fill();
                          textarea.style.lineHeight = "1.2";
                          textarea.style.padding = "0px";
                          textarea.style.margin = "0px";
                          textarea.style.border = "2px solid #3b82f6";
                          textarea.style.background =
                            "rgba(255, 255, 255, 0.95)";
                          textarea.style.outline = "none";
                          textarea.style.resize = "none";
                          textarea.style.overflow = "hidden";
                          textarea.style.transformOrigin = "left top";
                          textarea.style.zIndex = "10000";

                          // Handle rotation
                          const rotation = textNode.rotation();
                          if (rotation) {
                            textarea.style.transform = `rotate(${rotation}deg)`;
                          }

                          // Auto-resize height
                          textarea.style.height = "auto";
                          textarea.style.height = textarea.scrollHeight + "px";

                          textarea.focus();
                          textarea.select();

                          function removeTextarea() {
                            if (!textarea.parentNode) return;

                            const finalText = textarea.value;
                            textarea.parentNode.removeChild(textarea);
                            window.removeEventListener(
                              "click",
                              handleOutsideClick
                            );

                            // Update text content but maintain position
                            handleElementChange(el.id, {
                              text: finalText,
                              x: originalX, // Explicitly maintain position
                              y: originalY,
                            });

                            saveHistory(
                              elements.map((elem) =>
                                elem.id === el.id
                                  ? {
                                      ...elem,
                                      text: finalText,
                                      x: originalX,
                                      y: originalY,
                                    }
                                  : elem
                              )
                            );

                            textNode.show();
                            transformerRef.current.show();
                            transformerRef.current.forceUpdate();
                            layer.batchDraw();
                          }

                          // Auto-resize on input
                          textarea.addEventListener("input", function () {
                            textarea.style.height = "auto";
                            textarea.style.height =
                              textarea.scrollHeight + "px";
                          });

                          textarea.addEventListener("keydown", function (e) {
                            // Enter without shift = finish editing
                            if (e.keyCode === 13 && !e.shiftKey) {
                              e.preventDefault();
                              removeTextarea();
                            }
                            // Escape = cancel editing
                            if (e.keyCode === 27) {
                              textarea.value = textNode.text(); // Restore original
                              removeTextarea();
                            }
                          });

                          function handleOutsideClick(e) {
                            if (e.target !== textarea) {
                              removeTextarea();
                            }
                          }

                          // Delay adding click listener to prevent immediate trigger
                          setTimeout(() => {
                            window.addEventListener(
                              "click",
                              handleOutsideClick
                            );
                          }, 100);
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
                  if (el.type === "star") {
                    return (
                      <Star
                        {...commonProps}
                        numPoints={el.numPoints || 5}
                        innerRadius={el.innerRadius || 30}
                        outerRadius={el.outerRadius || 60}
                        fill={el.fill}
                        stroke={el.stroke || "#000000"}
                        strokeWidth={el.strokeWidth || 0}
                        opacity={el.opacity !== undefined ? el.opacity : 1}
                        rotation={el.rotation}
                      />
                    );
                  }
                  if (el.type === "line") {
                    return (
                      <Line
                        {...commonProps}
                        points={el.points}
                        stroke={el.stroke || "#000000"}
                        strokeWidth={el.strokeWidth || 3}
                        lineCap={el.lineCap || "round"}
                        lineJoin={el.lineJoin || "round"}
                        draggable={!el.locked}
                      />
                    );
                  }
                  if (el.type === "arrow") {
                    return (
                      <Arrow
                        {...commonProps}
                        points={el.points}
                        stroke={el.stroke || "#000000"}
                        fill={el.fill || el.stroke || "#000000"}
                        strokeWidth={el.strokeWidth || 3}
                        pointerLength={el.pointerLength || 10}
                        pointerWidth={el.pointerWidth || 10}
                        draggable={!el.locked}
                      />
                    );
                  }
                  return null;
                })}
                {/* Render current drawing line */}
                {currentLine && (
                  <Line
                    points={currentLine.points}
                    stroke={currentLine.stroke}
                    strokeWidth={currentLine.strokeWidth}
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
                <Transformer ref={transformerRef} />
              </Layer>
            </Stage>
          </div>
        </div>

        {/* CSV Fields Panel - Floating when CSV is loaded */}
        {showCsvFieldsPanel && csvFields.length > 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 border-2 border-blue-500 rounded-lg shadow-2xl p-4 z-50 max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                CSV Fields ({csvData.length} records)
              </h3>
              <button
                onClick={() => setShowCsvFieldsPanel(false)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
                title="Close Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Drag fields onto the canvas to create dynamic text elements
            </p>
            <div className="flex flex-wrap gap-2">
              {csvFields.map((field, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleFieldDragStart(e, field)}
                  onDragEnd={handleFieldDragEnd}
                  className={`
                    px-3 py-2 rounded-lg font-medium transition-all cursor-move select-none
                    ${
                      draggedField === field
                        ? "bg-green-600 text-white opacity-50"
                        : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                    }
                  `}
                  title={`Drag "${field}" to canvas to create text element`}
                >
                  {field}
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
              <span>
                💡 Tip:{" "}
                {draggedField
                  ? `Drop anywhere on canvas to create text with "${draggedField}"`
                  : "Drag a field to the canvas to create a dynamic text element"}
              </span>
            </div>
          </div>
        )}

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

                  {/* Font Family */}
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">
                      Font Family
                    </label>
                    <select
                      value={getSelectedElement().fontFamily || "Arial"}
                      onChange={(e) =>
                        updateSelectedElement("fontFamily", e.target.value)
                      }
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Comic Sans MS">Comic Sans MS</option>
                      <option value="Impact">Impact</option>
                      <option value="Trebuchet MS">Trebuchet MS</option>
                    </select>
                  </div>

                  {/* Text Formatting Buttons */}
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      Text Style
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const current =
                            getSelectedElement().fontStyle || "normal";
                          updateSelectedElement(
                            "fontStyle",
                            current === "bold" ? "normal" : "bold"
                          );
                        }}
                        className={`flex-1 p-2 rounded border ${
                          getSelectedElement().fontStyle === "bold"
                            ? "bg-blue-600 border-blue-500"
                            : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                        }`}
                        title="Bold"
                      >
                        <Bold size={18} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => {
                          const current =
                            getSelectedElement().textDecoration || "";
                          updateSelectedElement(
                            "textDecoration",
                            current === "italic" ? "" : "italic"
                          );
                        }}
                        className={`flex-1 p-2 rounded border ${
                          getSelectedElement().textDecoration === "italic"
                            ? "bg-blue-600 border-blue-500"
                            : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                        }`}
                        title="Italic"
                      >
                        <Italic size={18} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => {
                          const current =
                            getSelectedElement().textDecoration || "";
                          updateSelectedElement(
                            "textDecoration",
                            current === "underline" ? "" : "underline"
                          );
                        }}
                        className={`flex-1 p-2 rounded border ${
                          getSelectedElement().textDecoration === "underline"
                            ? "bg-blue-600 border-blue-500"
                            : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                        }`}
                        title="Underline"
                      >
                        <Underline size={18} className="mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      Text Alignment
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateSelectedElement("align", "left")}
                        className={`flex-1 p-2 rounded border ${
                          getSelectedElement().align === "left"
                            ? "bg-blue-600 border-blue-500"
                            : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                        }`}
                        title="Align Left"
                      >
                        <AlignLeft size={18} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => updateSelectedElement("align", "center")}
                        className={`flex-1 p-2 rounded border ${
                          getSelectedElement().align === "center"
                            ? "bg-blue-600 border-blue-500"
                            : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                        }`}
                        title="Align Center"
                      >
                        <AlignCenter size={18} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => updateSelectedElement("align", "right")}
                        className={`flex-1 p-2 rounded border ${
                          getSelectedElement().align === "right"
                            ? "bg-blue-600 border-blue-500"
                            : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                        }`}
                        title="Align Right"
                      >
                        <AlignRight size={18} className="mx-auto" />
                      </button>
                    </div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 border-b border-gray-300">
              <div className="w-full sm:w-auto">
                <h2 className="text-xl font-bold text-gray-900">
                  Design Preview
                </h2>
                {csvData.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1 break-words">
                    Showing record {previewRecordIndex + 1} of {csvData.length}
                    {csvData[previewRecordIndex] &&
                      Object.keys(csvData[previewRecordIndex]).length > 0 && (
                        <span className="block sm:inline sm:ml-2 text-blue-600 mt-1 sm:mt-0">
                          (
                          {Object.entries(csvData[previewRecordIndex])
                            .slice(0, 2)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                          )
                        </span>
                      )}
                  </p>
                )}
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors absolute top-4 right-4 sm:relative sm:top-0 sm:right-0"
              >
                <X size={24} className="text-gray-600 hover:text-gray-900" />
              </button>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50 min-h-0">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Design Preview"
                  className="shadow-2xl object-contain"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                    aspectRatio: `${STAGE_WIDTH} / ${STAGE_HEIGHT}`, // Maintain landscape ratio (10:7)
                  }}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-300 bg-white">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {csvData.length > 0 && (
                  <>
                    <button
                      onClick={handlePreviewPrevRecord}
                      disabled={previewRecordIndex === 0}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={handlePreviewNextRecord}
                      disabled={previewRecordIndex === csvData.length - 1}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Next →
                    </button>
                  </>
                )}
                <button
                  onClick={closePreview}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-all text-sm font-medium"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {csvData.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={async () => {
                        await checkCreditsAndExecute(
                          "generatePDF",
                          csvData.length,
                          handleExportAllPDFs
                        );
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm font-medium justify-center"
                      title="Download each record as a separate PDF file"
                    >
                      <Download size={18} />
                      Separate Files ({csvData.length}) -{" "}
                      {CREDIT_COSTS.generatePDF * csvData.length} credits
                    </button>
                    <button
                      onClick={async () => {
                        await checkCreditsAndExecute(
                          "generatePDF",
                          csvData.length,
                          handleExportAllAsSinglePDF
                        );
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-sm font-medium justify-center"
                      title="Download all records in one multi-page PDF file"
                    >
                      <Download size={18} />
                      Single File ({csvData.length} pages) -{" "}
                      {CREDIT_COSTS.generatePDF * csvData.length} credits
                    </button>
                  </div>
                )}
                <button
                  onClick={async () => {
                    await checkCreditsAndExecute("generatePDF", 1, async () => {
                      await handleExportPreviewedPDF();
                      closePreview();
                    });
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium justify-center"
                >
                  <Download size={18} />
                  Download Current ({CREDIT_COSTS.generatePDF} credits)
                </button>
              </div>
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
                onClick={handlePreviewBatch}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
              >
                <Eye size={18} />
                Preview Samples
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Preview Before Generate Modal */}
      {showBatchPreviewBeforeGenerate && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Preview Certificate Design
                </h2>
                <p className="text-sm text-gray-400">
                  Showing {previewSamples.length} sample
                  {previewSamples.length > 1 ? "s" : ""} from {csvData.length}{" "}
                  total records
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBatchPreviewBeforeGenerate(false);
                  setPreviewSamples([]);
                  setShowCsvModal(true); // Go back to CSV modal
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-4">
              <div className="h-full overflow-y-auto space-y-4">
                {/* Info Banner */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-300 text-sm font-semibold mb-2">
                    📋 Preview Mode
                  </p>
                  <p className="text-gray-300 text-sm">
                    Review how your design looks with real CSV data. If
                    everything looks good, click{" "}
                    <strong>
                      "Generate All {csvData.length} Certificates"
                    </strong>{" "}
                    below.
                  </p>
                  {previewSamples.length < csvData.length && (
                    <p className="text-gray-400 text-xs mt-2">
                      💡 Showing first {previewSamples.length} samples. All{" "}
                      {csvData.length} will be generated.
                    </p>
                  )}
                </div>

                {/* Preview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {previewSamples.map((sample, index) => (
                    <div
                      key={index}
                      className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <FileText size={20} className="text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {sample.recipient?.name ||
                              sample.recipient?.fullname ||
                              `Recipient ${sample.recipientNumber}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            Sample #{sample.recipientNumber}
                          </p>
                        </div>
                      </div>
                      <div className="relative bg-white rounded-lg overflow-hidden">
                        <img
                          src={sample.dataURL}
                          alt={`Certificate preview ${index + 1}`}
                          className="w-full h-auto"
                        />
                      </div>
                      {/* Show some data fields */}
                      <div className="mt-3 p-2 bg-gray-800 rounded text-xs">
                        <p className="text-gray-400 mb-1">CSV Data:</p>
                        {Object.entries(sample.recipient)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <p key={key} className="text-gray-300">
                              <span className="text-gray-500">{key}:</span>{" "}
                              {value}
                            </p>
                          ))}
                        {Object.keys(sample.recipient).length > 3 && (
                          <p className="text-gray-500 mt-1">
                            +{Object.keys(sample.recipient).length - 3} more
                            fields
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-900">
              <button
                onClick={() => {
                  setShowBatchPreviewBeforeGenerate(false);
                  setPreviewSamples([]);
                  setShowCsvModal(true);
                }}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                ← Back to Design
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBatchPreviewBeforeGenerate(false);
                    setPreviewSamples([]);
                  }}
                  className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowBatchPreviewBeforeGenerate(false);
                    setPreviewSamples([]);
                    await generateBatchPDFs();
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-lg"
                >
                  <Download size={18} />
                  Generate All {csvData.length} Certificates
                </button>
              </div>
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

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Select Emoji</h2>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-8 gap-2 max-h-96 overflow-y-auto">
                {[
                  "😀",
                  "😃",
                  "😄",
                  "😁",
                  "😆",
                  "😅",
                  "🤣",
                  "😂",
                  "🙂",
                  "🙃",
                  "😉",
                  "😊",
                  "😇",
                  "🥰",
                  "😍",
                  "🤩",
                  "😘",
                  "😗",
                  "😚",
                  "😙",
                  "😋",
                  "😛",
                  "😜",
                  "🤪",
                  "😝",
                  "🤑",
                  "🤗",
                  "🤭",
                  "🤫",
                  "🤔",
                  "🤐",
                  "🤨",
                  "😐",
                  "😑",
                  "😶",
                  "😏",
                  "😒",
                  "🙄",
                  "😬",
                  "🤥",
                  "😌",
                  "😔",
                  "😪",
                  "🤤",
                  "😴",
                  "😷",
                  "🤒",
                  "🤕",
                  "🤢",
                  "🤮",
                  "🤧",
                  "🥵",
                  "🥶",
                  "🥴",
                  "😵",
                  "🤯",
                  "🤠",
                  "🥳",
                  "😎",
                  "🤓",
                  "🧐",
                  "😕",
                  "😟",
                  "🙁",
                  "☹️",
                  "😮",
                  "😯",
                  "😲",
                  "😳",
                  "🥺",
                  "😦",
                  "😧",
                  "😨",
                  "😰",
                  "😥",
                  "😢",
                  "😭",
                  "😱",
                  "😖",
                  "😣",
                  "😞",
                  "😓",
                  "😩",
                  "😫",
                  "🥱",
                  "😤",
                  "😡",
                  "😠",
                  "🤬",
                  "😈",
                  "👿",
                  "💀",
                  "☠️",
                  "💩",
                  "🤡",
                  "👹",
                  "👺",
                  "👻",
                  "👽",
                  "👾",
                  "🤖",
                  "😺",
                  "😸",
                  "😹",
                  "😻",
                  "😼",
                  "😽",
                  "🙀",
                  "😿",
                  "😾",
                  "👋",
                  "🤚",
                  "🖐",
                  "✋",
                  "🖖",
                  "👌",
                  "🤏",
                  "✌️",
                  "🤞",
                  "🤟",
                  "🤘",
                  "🤙",
                  "👈",
                  "👉",
                  "👆",
                  "👇",
                  "☝️",
                  "👍",
                  "👎",
                  "✊",
                  "👊",
                  "🤛",
                  "🤜",
                  "👏",
                  "🙌",
                  "👐",
                  "🤲",
                  "🤝",
                  "🙏",
                  "✍️",
                  "💅",
                  "🤳",
                  "💪",
                  "🦾",
                  "🦿",
                  "🦵",
                  "🦶",
                  "👂",
                  "🦻",
                  "👃",
                  "🧠",
                  "🦷",
                  "🦴",
                  "👀",
                  "👁",
                  "👅",
                  "👄",
                  "💋",
                  "🩸",
                  "❤️",
                  "🧡",
                  "💛",
                  "💚",
                  "💙",
                  "💜",
                  "🖤",
                  "🤍",
                  "🤎",
                  "💔",
                  "❣️",
                  "💕",
                  "💞",
                  "💓",
                  "💗",
                  "💖",
                  "💘",
                  "💝",
                  "💟",
                  "☮️",
                  "✝️",
                  "☪️",
                  "🕉",
                  "☸️",
                  "✡️",
                  "🔯",
                  "🕎",
                  "☯️",
                  "☦️",
                  "🛐",
                  "⛎",
                  "♈",
                  "♉",
                  "♊",
                  "♋",
                  "♌",
                  "♍",
                  "♎",
                  "♏",
                  "♐",
                  "♑",
                  "⭐",
                  "🌟",
                  "✨",
                  "⚡",
                  "🔥",
                  "💥",
                  "☄️",
                  "🌈",
                  "☀️",
                  "🌤",
                  "⛅",
                  "🌥",
                  "☁️",
                  "🌦",
                  "🌧",
                  "⛈",
                  "🌩",
                  "🌨",
                  "❄️",
                  "☃️",
                  "⛄",
                  "🌬",
                  "💨",
                  "💧",
                  "💦",
                  "☔",
                  "☂️",
                  "🌊",
                  "🌫",
                  "🎉",
                  "🎊",
                  "🎈",
                  "🎁",
                  "🏆",
                  "🥇",
                  "🥈",
                  "🥉",
                  "⚽",
                  "⚾",
                  "🥎",
                ].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddEmoji(emoji)}
                    className="text-3xl p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title={`Add ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showCreditModal}
        onClose={() => {
          setShowCreditModal(false);
          setPendingExportAction(null);
        }}
        onConfirm={handleCreditConfirmation}
        operation="generatePDF"
        count={pendingExportAction?.count || 1}
        currentBalance={credits}
        loading={creditCheckLoading}
      />
    </div>
  );
};

export default KonvaPdfDesigner;
