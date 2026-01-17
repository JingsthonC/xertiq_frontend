import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import showToast from "../utils/toast";
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
  Clipboard,
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
  CloudUpload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import useWalletStore from "../store/wallet";
import CreditConfirmationModal from "./CreditConfirmationModal";
import { CREDIT_COSTS } from "../services/api";
import apiService from "../services/api";
import konvaPdfGenerator from "../services/konvaPdfGenerator";

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
  const [showActualData, setShowActualData] = useState(false); // Toggle between placeholder and actual data

  // Multi-select states
  const [selectedIds, setSelectedIds] = useState([]); // Array of selected IDs

  // Selection box states (for drag selection)
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null); // { x1, y1, x2, y2 }

  // Copy/paste states
  const [copiedElements, setCopiedElements] = useState([]);

  // New states for advanced features
  const [drawingMode, setDrawingMode] = useState(null); // 'pen', 'line', 'arrow'
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false); // Export dropdown menu
  const [scale, setScale] = useState(1); // Canvas scale for zoom
  const [zoomInputValue, setZoomInputValue] = useState(""); // For editable zoom input
  const [isEditingZoom, setIsEditingZoom] = useState(false); // Track if zoom input is being edited
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true); // Properties panel visibility

  // Credit system states
  const { credits, fetchCredits, updateCredits, user } = useWalletStore();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [pendingExportAction, setPendingExportAction] = useState(null);
  const [creditCheckLoading, setCreditCheckLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const layerRef = useRef(null);
  const fileUploadRef = useRef(null);
  const csvUploadRef = useRef(null);
  const uploadMenuButtonRef = useRef(null);
  const isLoadingTemplate = useRef(false); // Track if we're loading a template
  const lastSyncedElements = useRef(null); // Track last synced elements to prevent loops
  const isProgrammaticTransform = useRef(false); // Track if transform is programmatic (flip, etc.)

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
                i % 2 === 0 ? p * pixelToMmX : p * pixelToMmY,
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
      const template = {
        name: initialTemplate?.name || "Konva Design",
        orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
        format: "a4",
        backgroundColor: "#ffffff",
        stageWidth: STAGE_WIDTH,
        stageHeight: STAGE_HEIGHT,
        elements: templateElements,
        version: "1.0", // Template format version
      };
      onTemplateChange(template);
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
      // Use template's stage dimensions if available (for templates saved from Konva)
      // Otherwise use default STAGE_WIDTH/STAGE_HEIGHT
      const templateStageWidth = initialTemplate.stageWidth || STAGE_WIDTH;
      const templateStageHeight = initialTemplate.stageHeight || STAGE_HEIGHT;
      const mmToPixelX = templateStageWidth / 297; // ~3.37
      const mmToPixelY = templateStageHeight / 210; // ~3.33

      // Debug: Log conversion factors to help diagnose coordinate issues
      if (process.env.NODE_ENV === "development") {
        console.log("Loading template:", {
          hasStageDimensions: !!(
            initialTemplate.stageWidth && initialTemplate.stageHeight
          ),
          templateStageWidth,
          templateStageHeight,
          defaultStageWidth: STAGE_WIDTH,
          defaultStageHeight: STAGE_HEIGHT,
          mmToPixelX,
          mmToPixelY,
          elementCount: initialTemplate.elements?.length || 0,
        });
      }

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
            // Load image from src if available
            let imageObj = null;
            if (el.src) {
              const img = new window.Image();
              img.crossOrigin = "anonymous";
              img.src = el.src;
              imageObj = img;
            }

            return {
              ...baseElement,
              type: "image",
              src: el.src,
              image: imageObj,
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
                    i % 2 === 0 ? p * mmToPixelX : p * mmToPixelY,
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
                    i % 2 === 0 ? p * mmToPixelX : p * mmToPixelY,
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

  // Auto-calculate scale to fit container on mount and resize
  useEffect(() => {
    const calculateScale = () => {
      const container = document.querySelector(".konva-canvas-container");
      if (container) {
        const containerWidth = container.clientWidth - 32; // Account for padding
        const containerHeight = container.clientHeight - 32;
        const scaleX = containerWidth / STAGE_WIDTH;
        const scaleY = containerHeight / STAGE_HEIGHT;
        const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
        setScale(Math.max(0.25, newScale)); // Minimum 25% zoom
      }
    };

    // Calculate on mount
    setTimeout(calculateScale, 100);

    // Recalculate on window resize
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  // Reset zoom input when not editing and scale changes externally
  useEffect(() => {
    if (!isEditingZoom) {
      setZoomInputValue("");
    }
  }, [scale, isEditingZoom]);

  // Attach transformer to selected node
  useEffect(() => {
    // Skip transformer updates during programmatic transforms (like flip)
    if (isProgrammaticTransform.current) {
      return;
    }

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

  // Keyboard shortcuts for the editor
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

      // Ctrl+C or Cmd+C - Copy (only if elements are selected)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "c" &&
        (selectedId || selectedIds.length > 0)
      ) {
        e.preventDefault();
        handleCopy();
        return;
      }

      // Ctrl+V or Cmd+V - Paste (only if there are copied elements)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "v" &&
        copiedElements.length > 0
      ) {
        e.preventDefault();
        handlePaste();
        return;
      }

      // Ctrl+Z or Cmd+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Ctrl+Y or Cmd+Shift+Z - Redo
      if (
        (e.ctrlKey && e.key === "y") ||
        (e.metaKey && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Delete key - delete selected element(s)
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        (selectedId || selectedIds.length > 0)
      ) {
        e.preventDefault();
        handleDelete();
        return;
      }

      // Escape - deselect
      if (e.key === "Escape" && (selectedId || selectedIds.length > 0)) {
        setSelectedId(null);
        setSelectedIds([]);
        return;
      }

      // Ctrl/Cmd + Plus/Equal - Zoom In
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setScale((prev) => Math.min(2, prev + 0.1));
        return;
      }

      // Ctrl/Cmd + Minus - Zoom Out
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setScale((prev) => Math.max(0.25, prev - 0.1));
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, selectedIds, elements, copiedElements, history, historyStep]); // Include history for undo/redo

  /**
   * Saves the current state of elements to the history stack.
   * This is used for undo/redo functionality.
   * @param {Array} newElements - The new array of elements to save.
   */
  const saveHistory = (newElements) => {
    // Create a deep copy to avoid reference issues
    const elementsCopy = JSON.parse(JSON.stringify(newElements));
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(elementsCopy);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep > 0 && history.length > 0) {
      const newStep = historyStep - 1;
      const previousState = history[newStep];
      if (previousState && Array.isArray(previousState)) {
        setHistoryStep(newStep);
        setElements([...previousState]); // Create a new array to trigger re-render
        setSelectedId(null);
        setSelectedIds([]);
      }
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1 && history.length > 0) {
      const newStep = historyStep + 1;
      const nextState = history[newStep];
      if (nextState && Array.isArray(nextState)) {
        setHistoryStep(newStep);
        setElements([...nextState]); // Create a new array to trigger re-render
        setSelectedId(null);
        setSelectedIds([]);
      }
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
      fill: "#4A70A9",
      stroke: "#3A5A89",
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
      el.id === selectedId ? { ...el, locked: !el.locked } : el,
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
        img.crossOrigin = "anonymous"; // Allow cross-origin images
        img.src = event.target.result;
        img.onload = () => {
          // Scale image if it's too large for the canvas
          const maxWidth = 400;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width = width * scale;
            height = height * scale;
          }

          const newImage = {
            id: `image-${Date.now()}`,
            type: "image",
            x: 100,
            y: 100,
            image: img,
            src: event.target.result, // Store data URL for persistence
            width: width,
            height: height,
          };
          const newElements = [...elements, newImage];
          setElements(newElements);
          saveHistory(newElements);
        };
        img.onerror = (error) => {
          console.error("Error loading image:", error);
          showToast.error(
            "Failed to load image. Please try a different image file.",
          );
        };
      };
      reader.readAsDataURL(file);
    }
    // Reset file input so same file can be uploaded again
    e.target.value = "";
  };

  const handleDelete = () => {
    // Delete all selected elements (multi-select or single)
    const idsToDelete =
      selectedIds.length > 0 ? selectedIds : selectedId ? [selectedId] : [];
    if (idsToDelete.length === 0) return;

    const newElements = elements.filter((el) => !idsToDelete.includes(el.id));
    setSelectedId(null);
    setSelectedIds([]);
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
    if (!stage) return;

    try {
      // Hide transformer before generating preview
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
        layerRef.current?.batchDraw();
      }

      // Wait a bit for transformer to disappear from canvas
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (csvData.length > 0 && recordIndex < csvData.length) {
        const record = csvData[recordIndex];

        // Use the new preview generator service
        const dataURL = konvaPdfGenerator.generatePreview(stage, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
          data: record,
          elements,
        });
        setPreviewUrl(dataURL);
        setShowPreview(true);
      } else {
        // No CSV data, show as-is with white background
        const dataURL = konvaPdfGenerator.generatePreview(stage, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
          elements,
        });
        setPreviewUrl(dataURL);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      showToast.error("Failed to generate preview: " + error.message);
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
      showToast.warning("Please upload CSV data first");
      return;
    }

    // Check if there are any dynamic fields assigned
    const hasDynamicFields = elements.some(
      (el) => el.type === "text" && el.isDynamic && el.dataField,
    );

    if (!hasDynamicFields) {
      const proceed = window.confirm(
        "⚠️ No dynamic fields assigned!\n\nYou haven't assigned any CSV fields to text elements.\n\n" +
          "To use CSV data:\n1. Select a text element\n2. Check 'Dynamic Field (from CSV)'\n3. Enter the CSV field name\n\n" +
          "Continue anyway to preview?",
      );
      if (!proceed) return;
    }

    setSelectedId(null);
    setSelectedIds([]);

    // Hide transformer before generating preview
    if (transformerRef.current) {
      transformerRef.current.nodes([]);
      layerRef.current?.batchDraw();
    }

    const samples = [];

    // Preview first 3 records (or all if less than 3)
    const samplesToPreview = Math.min(csvData.length, 3);

    // Wait for transformer to disappear from canvas
    await new Promise((resolve) => setTimeout(resolve, 100));

    const stage = stageRef.current;
    if (!stage) return;

    for (let i = 0; i < samplesToPreview; i++) {
      const record = csvData[i];

      // Use the new preview generator service
      const dataURL = konvaPdfGenerator.generatePreview(stage, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        data: record,
        elements,
      });

      samples.push({
        dataURL,
        recipient: record,
        recipientNumber: i + 1,
      });
    }

    setPreviewSamples(samples);
    setShowBatchPreviewBeforeGenerate(true);
    setShowCsvModal(false);
  };

  const generateBatchPDFs = async () => {
    if (csvData.length === 0) {
      showToast.warning("Please upload CSV data first");
      return;
    }

    setSelectedId(null);
    const stage = stageRef.current;
    if (!stage) return;

    // Wait for deselection
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Use the new batch PDF generator service
      const pdfs = await konvaPdfGenerator.generateBatch(stage, csvData, {
        orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
        format: "a4",
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        elements,
        filenamePattern: "certificate_{{name}}_{{index}}.pdf",
      });

      // Convert to preview format with data URLs
      const previews = await Promise.all(
        pdfs.map(async (pdfData, i) => {
          // Generate preview data URL for display
          const previewDataURL = konvaPdfGenerator.generatePreview(stage, {
            backgroundColor: "#ffffff",
            pixelRatio: 2,
            data: pdfData.data,
            elements,
          });

          return {
            pdf: pdfData.pdf,
            dataURL: previewDataURL,
            filename: pdfData.filename,
            recipient: pdfData.data,
          };
        }),
      );

      setBatchPreviews(previews);
      setShowBatchPreview(true);
      setShowCsvModal(false);
    } catch (error) {
      console.error("Error generating batch PDFs:", error);
      showToast.error("Failed to generate PDFs: " + error.message);
    }
  };

  const downloadBatchPDF = (pdf, filename) => {
    konvaPdfGenerator.downloadPDF(pdf, filename);
  };

  const downloadAllBatchPDFs = () => {
    batchPreviews.forEach(({ pdf, filename }) => {
      pdf.save(filename);
    });
    showToast.success(
      `Successfully downloaded ${batchPreviews.length} certificate(s)!`,
    );
  };

  const closeBatchPreview = () => {
    setShowBatchPreview(false);
    setBatchPreviews([]);
  };

  // Credit system check function
  const checkCreditsAndExecute = async (operation, count, exportFunction) => {
    // Production-safe logging (only in development)
    if (import.meta.env.DEV) {
      console.log("checkCreditsAndExecute called:", {
        operation,
        count,
        credits,
        exportFunction: !!exportFunction,
      });
    }

    setCreditCheckLoading(true);

    try {
      // Always fetch latest credits to ensure accuracy
      if (import.meta.env.DEV) {
        console.log("Fetching latest credits from server...");
      }

      let currentCredits = typeof credits === "number" ? credits : null;

      try {
        const fetchedCredits = await fetchCredits();
        currentCredits =
          fetchedCredits !== null && fetchedCredits !== undefined
            ? fetchedCredits
            : typeof credits === "number"
              ? credits
              : 0;
      } catch (fetchError) {
        console.error("Failed to fetch credits:", fetchError);
        // Try to use cached credits if available
        currentCredits = typeof credits === "number" ? credits : 0;
      }

      if (
        currentCredits === null ||
        currentCredits === undefined ||
        isNaN(currentCredits)
      ) {
        console.error("Unable to determine credit balance");
        showToast.error(
          "Unable to fetch credit balance. Please refresh the page or contact support.",
        );
        setCreditCheckLoading(false);
        return;
      }

      // Calculate cost
      const cost = CREDIT_COSTS[operation] * count;

      if (import.meta.env.DEV) {
        console.log("Credit check:", {
          currentCredits,
          cost,
          operation,
          count,
        });
      }

      // Check if sufficient credits
      if (currentCredits < cost) {
        if (import.meta.env.DEV) {
          console.log("Insufficient credits, showing modal");
        }
        // Close any open dropdowns before showing modal
        setShowUploadMenu(false);
        setShowExportMenu(false);
        setPendingExportAction({ operation, count, cost });
        setTimeout(() => {
          setShowCreditModal(true);
        }, 50);
        setCreditCheckLoading(false);
        return;
      }

      // Close any open dropdowns before showing modal
      setShowUploadMenu(false);
      setShowExportMenu(false);

      // Show confirmation modal
      if (import.meta.env.DEV) {
        console.log("Sufficient credits, showing confirmation modal", {
          operation,
          count,
          cost,
          hasExportFunction: !!exportFunction,
        });
      }
      setPendingExportAction({ operation, count, cost, exportFunction });

      // Use setTimeout to ensure dropdowns close first, then show modal
      setTimeout(() => {
        setShowCreditModal(true);
        // Debug: Log modal state in production too (for troubleshooting)
        console.log("Credit modal opened:", {
          operation,
          count,
          cost,
          currentCredits,
        });
      }, 50);
    } catch (error) {
      console.error("Credit check failed:", error);
      const errorMessage =
        error?.message || error?.toString() || "Unknown error";
      showToast.error(`Failed to check credits: ${errorMessage}`);
    } finally {
      setCreditCheckLoading(false);
    }
  };

  // Handle credit modal confirmation
  const handleCreditConfirmation = async () => {
    console.log("Credit confirmation clicked", {
      pendingExportAction,
      hasFunction: !!pendingExportAction?.exportFunction,
    });

    if (!pendingExportAction || !pendingExportAction.exportFunction) {
      console.error("No pending action or export function available");
      showToast.error("No action to execute. Please try again.");
      setShowCreditModal(false);
      setPendingExportAction(null);
      return;
    }

    setCreditCheckLoading(true);
    setShowCreditModal(false);

    try {
      console.log("Executing export function:", pendingExportAction.operation);
      // Execute the export function
      await pendingExportAction.exportFunction();

      // Update credits locally (backend should also update)
      const newCredits = credits - pendingExportAction.cost;
      updateCredits(newCredits);

      // Fetch latest balance from server
      await fetchCredits();

      console.log("Export completed successfully");
    } catch (error) {
      console.error("Export failed:", error);
      const errorMessage =
        error?.message || error?.toString() || "Unknown error";
      showToast.error(
        `Export failed: ${errorMessage}. Credits were not deducted.`,
      );
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
        try {
          // Use the new PDF generator service with proper A4 dimensions
          const pdf = konvaPdfGenerator.generateFromStage(stage, {
            orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
            format: "a4",
            backgroundColor: "#ffffff",
            pixelRatio: 2,
            elements,
          });

          // Download the PDF
          konvaPdfGenerator.downloadPDF(pdf, "certificate.pdf");
        } catch (error) {
          console.error("Error generating PDF:", error);
          showToast.error("Failed to generate PDF: " + error.message);
        }
      }
    }, 100);
  };

  const handleExportPreviewedPDF = async () => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!stage || !layer) return;

    try {
      // If CSV data exists, export with the current record's data
      if (csvData.length > 0 && previewRecordIndex < csvData.length) {
        const record = csvData[previewRecordIndex];

        // Use the new PDF generator service with data replacement
        const pdf = konvaPdfGenerator.generateSingle(stage, record, {
          orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
          format: "a4",
          backgroundColor: "#ffffff",
          pixelRatio: 2,
          elements,
        });

        // Generate filename from record data
        const recordName =
          record.name || record.Name || `record_${previewRecordIndex + 1}`;
        konvaPdfGenerator.downloadPDF(
          pdf,
          `certificate_${recordName.replace(/\s+/g, "_")}.pdf`,
        );
      } else {
        // No CSV data, export as-is
        handleExportPDF();
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast.error("Failed to generate PDF: " + error.message);
    }
  };

  const handleExportAllPDFs = async () => {
    if (csvData.length === 0) {
      showToast.warning("No CSV data to export");
      return;
    }

    const confirmExport = window.confirm(
      `This will generate ${csvData.length} PDF files. Continue?`,
    );

    if (!confirmExport) return;

    const stage = stageRef.current;
    if (!stage) return;

    // Close preview and show progress
    closePreview();

    try {
      // Use the new batch PDF generator
      const pdfs = await konvaPdfGenerator.generateBatch(stage, csvData, {
        orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
        format: "a4",
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        elements,
        filenamePattern: "certificate_{{name}}_{{index}}.pdf",
      });

      // Download each PDF with a small delay to prevent browser blocking
      for (let i = 0; i < pdfs.length; i++) {
        konvaPdfGenerator.downloadPDF(pdfs[i].pdf, pdfs[i].filename);
        if (i < pdfs.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      showToast.success(
        `✓ Successfully generated ${pdfs.length} PDF certificates!`,
      );
    } catch (error) {
      console.error("Error generating batch PDFs:", error);
      showToast.error("Failed to generate PDFs: " + error.message);
    }
  };

  const handleExportAllAsSinglePDF = async () => {
    if (csvData.length === 0) {
      showToast.warning("No CSV data to export");
      return;
    }

    const confirmExport = window.confirm(
      `This will generate 1 PDF file with ${csvData.length} pages. Continue?`,
    );

    if (!confirmExport) return;

    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!stage || !layer) return;

    // Close preview and show progress
    closePreview();

    // Create a single PDF document with A4 dimensions
    const pdf = new jsPDF({
      orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

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

      // Add the image to the current page with proper A4 dimensions
      pdf.addImage(
        dataURL,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST",
      );

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
    showToast.success(
      `✓ Successfully generated 1 PDF with ${csvData.length} pages!`,
    );
  };

  // Upload to Blockchain functions
  const handleUploadToBlockchain = async () => {
    // Deselect any element to remove transformer from the exported image
    setSelectedId(null);
    setSelectedIds([]);

    // Wait for deselection
    await new Promise((resolve) => setTimeout(resolve, 100));

    const stage = stageRef.current;
    if (!stage) {
      showToast.error("Stage not available. Please try again.");
      return;
    }

    // Check if user email is available
    if (!user?.email) {
      showToast.error("User email not found. Please log in again.");
      return;
    }

    setIsUploading(true);

    try {
      // Generate PDF
      const pdf = konvaPdfGenerator.generateFromStage(stage, {
        orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
        format: "a4",
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        elements,
      });

      // Convert to File with a specific filename
      const pdfFilename = "certificate.pdf";
      const pdfFile = konvaPdfGenerator.pdfToFile(pdf, pdfFilename);

      // Get template name or default title
      const title = initialTemplate?.name || "Certificate";

      // Extract email from PDF content (text elements)
      // This is smarter - it reads the actual email from the certificate content
      const extractEmailFromContent = () => {
        // Email regex pattern
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

        // Scan all text elements for email addresses
        for (const element of elements) {
          if (element.type === "text" && element.text) {
            const matches = element.text.match(emailRegex);
            if (matches && matches.length > 0) {
              // Return the first email found
              return matches[0];
            }
          }
        }

        return null;
      };

      const extractedEmail = extractEmailFromContent();

      if (!extractedEmail) {
        showToast.warning(
          "No email address found in the certificate content. Please add an email address to the certificate text.",
        );
        setIsUploading(false);
        return;
      }

      console.log("📧 Extracted email from PDF content:", extractedEmail);
      console.log("📄 Certificate elements:", elements);

      // Auto-generate CSV file for single document upload
      // Uses the email extracted from the actual PDF content
      const csvFile = konvaPdfGenerator.generateSingleDocumentCSV(
        pdfFilename,
        extractedEmail, // Uses email from PDF content, not logged-in user
        title,
        {
          course: title,
          completion_date: new Date().toISOString().split("T")[0],
        },
      );

      // Create FormData with PDF and CSV (using batch endpoint format)
      const formData = new FormData();
      formData.append("certificates", pdfFile);
      formData.append("metadata", csvFile);

      // Upload via batch API (which goes through Merkle tree pipeline + blockchain)
      const response = await apiService.createBatch(formData);

      // Handle batch response structure
      const batchId =
        response.batchId || response.batch?.id || response.id || "N/A";
      const merkleRoot =
        response.merkleRoot || response.batch?.merkleRoot || "N/A";
      const txSig =
        response.solanaTransaction ||
        response.txSig ||
        response.batch?.txSig ||
        "N/A";
      const explorerUrl =
        response.explorerUrl || response.batch?.explorerUrl || "";

      let successMessage = `✓ Successfully uploaded to blockchain!\n\n`;
      successMessage += `Batch ID: ${batchId}\n`;
      successMessage += `Merkle Root: ${merkleRoot}\n`;
      successMessage += `Transaction: ${txSig}`;
      if (explorerUrl) {
        successMessage += `\n\nView on blockchain: ${explorerUrl}`;
      }

      showToast.success(successMessage);

      // Refresh credits after upload
      await fetchCredits();
    } catch (error) {
      console.error("Error uploading to blockchain:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Upload failed";
      showToast.error(`Failed to upload to blockchain: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadBatchToBlockchain = async () => {
    if (csvData.length === 0) {
      showToast.warning("No CSV data to upload");
      return;
    }

    const confirmUpload = window.confirm(
      `This will upload ${csvData.length} PDF files to blockchain as a batch. Continue?`,
    );

    if (!confirmUpload) return;

    const stage = stageRef.current;
    if (!stage) {
      showToast.error("Stage not available. Please try again.");
      return;
    }

    setIsUploading(true);

    try {
      // Generate all PDFs (filenames will be sanitized in konvaPdfGenerator)
      const pdfs = await konvaPdfGenerator.generateBatch(stage, csvData, {
        orientation: STAGE_WIDTH > STAGE_HEIGHT ? "landscape" : "portrait",
        format: "a4",
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        elements,
        filenamePattern: "certificate_{{name}}_{{index}}.pdf",
      });

      // Log generated filenames for debugging
      console.log(
        "Generated PDF filenames:",
        pdfs.map((p) => p.filename),
      );

      // Convert PDFs to Files
      const pdfFiles = pdfs.map((item) =>
        konvaPdfGenerator.pdfToFile(item.pdf, item.filename),
      );

      // Add filename column to CSV data to match PDF filenames exactly
      // Use the same filename generation logic as PDF generation (with sanitization)
      const csvDataWithFilenames = csvData.map((row, index) => {
        // Generate filename using the same pattern and sanitization as PDF generation
        const sanitize = (value) => {
          if (!value) return "";
          return value
            .toString()
            .replace(/\s+/g, "_") // Replace spaces with underscores
            .replace(/[^a-zA-Z0-9_-]/g, "") // Remove special characters
            .substring(0, 50); // Limit length
        };

        let filename = "certificate_{{name}}_{{index}}.pdf";
        const nameValue = row.name || row.Name || `record_${index + 1}`;
        filename = filename.replace(/\{\{name\}\}/g, sanitize(nameValue));
        filename = filename.replace(/\{\{index\}\}/g, index + 1);
        Object.keys(row).forEach((key) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
          filename = filename.replace(regex, sanitize(row[key]));
        });

        return {
          ...row,
          filename: filename, // Must match PDF filename exactly (sanitized)
        };
      });

      // Log CSV filenames for debugging
      console.log(
        "CSV filenames:",
        csvDataWithFilenames.map((r) => r.filename),
      );

      // Generate CSV File with filename column
      const csvFile = konvaPdfGenerator.generateCSVFile(
        csvDataWithFilenames,
        "metadata.csv",
      );

      // Create FormData
      const formData = new FormData();
      pdfFiles.forEach((file) => {
        formData.append("certificates", file);
      });
      formData.append("metadata", csvFile);

      // Upload via batch API
      const response = await apiService.createBatch(formData);

      showToast.success(
        `✓ Successfully uploaded batch to blockchain! Batch ID: ${
          response.batch?.id || response.id || "N/A"
        } - ${pdfFiles.length} documents`,
      );

      // Refresh credits after upload
      await fetchCredits();
    } catch (error) {
      console.error("Error uploading batch to blockchain:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Batch upload failed";
      showToast.error(`Failed to upload batch to blockchain: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
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
    // Check if Ctrl/Cmd or Shift is pressed
    const isCtrlSelect = e.evt.ctrlKey || e.evt.metaKey;
    const isShiftSelect = e.evt.shiftKey;

    if (isCtrlSelect || isShiftSelect) {
      // Multi-select mode
      if (selectedIds.includes(elementId)) {
        // Remove from selection (only with Ctrl/Cmd, not Shift)
        if (isCtrlSelect && !isShiftSelect) {
          const newSelectedIds = selectedIds.filter((id) => id !== elementId);
          setSelectedIds(newSelectedIds);
          setSelectedId(newSelectedIds.length > 0 ? newSelectedIds[0] : null);
        }
        // With Shift, keep it selected (do nothing)
      } else {
        // Add to selection
        const newSelectedIds = [...selectedIds, elementId];
        setSelectedIds(newSelectedIds);
        setSelectedId(elementId);
      }
    } else {
      // Single select mode
      setSelectedId(elementId);
      setSelectedIds([elementId]);
    }
  };

  // Copy selected elements
  const handleCopy = () => {
    const idsToCopy =
      selectedIds.length > 0 ? selectedIds : selectedId ? [selectedId] : [];
    if (idsToCopy.length === 0) return;

    const elementsToCopy = elements.filter((el) => idsToCopy.includes(el.id));
    setCopiedElements(elementsToCopy);
    console.log(`Copied ${elementsToCopy.length} element(s)`);
  };

  // Paste copied elements
  const handlePaste = () => {
    if (copiedElements.length === 0) return;

    const offset = 20; // Offset for pasted elements
    const newElements = copiedElements.map((el, index) => {
      const newId = `${el.id}-copy-${Date.now()}-${index}`;
      return {
        ...el,
        id: newId,
        x: (el.x || 0) + offset,
        y: (el.y || 0) + offset,
      };
    });

    const updatedElements = [...elements, ...newElements];
    setElements(updatedElements);
    saveHistory(updatedElements);

    // Select the pasted elements
    const newIds = newElements.map((el) => el.id);
    setSelectedIds(newIds);
    setSelectedId(newIds[0] || null);
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
      // Save history for undo/redo
      saveHistory(newElements);
    }
  };

  const handleDragEnd = (e, id) => {
    const element = elements.find((el) => el.id === id);
    const node = e.target;

    // For images, convert adjusted position back to stored position
    if (element?.type === "image") {
      const imageWidth = element.width || 100;
      const imageHeight = element.height || 100;
      const scaleX = element.scaleX !== undefined ? element.scaleX : 1;
      const scaleY = element.scaleY !== undefined ? element.scaleY : 1;
      const nodeX = node.x();
      const nodeY = node.y();
      // Reverse the adjustment we applied during render
      const topLeftX = nodeX - (scaleX < 0 ? imageWidth : 0);
      const topLeftY = nodeY - (scaleY < 0 ? imageHeight : 0);
      const newAttrs = { x: topLeftX, y: topLeftY };
      const updatedElements = elements.map((el) =>
        el.id === id ? { ...el, ...newAttrs } : el,
      );
      setElements(updatedElements);
      saveHistory(updatedElements);
    } else {
      const newAttrs = { x: node.x(), y: node.y() };
      const updatedElements = elements.map((el) =>
        el.id === id ? { ...el, ...newAttrs } : el,
      );
      setElements(updatedElements);
      saveHistory(updatedElements);
    }
  };

  const handleTransformEnd = (e, id) => {
    // Skip if this is a programmatic transform (like flip)
    if (isProgrammaticTransform.current) {
      console.log("Skipping handleTransformEnd - programmatic transform");
      return; // Don't reset the flag here, let the flip handler manage it
    }

    const node = e.target;

    // Use functional update to get latest element state
    setElements((prevElements) => {
      const element = prevElements.find((el) => el.id === id);
      if (!element) return prevElements;

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // For images, preserve the flip state (sign of scaleX/scaleY)
      // For other elements, reset scale to 1 and apply to width/height
      if (element.type === "image") {
        // Get the original scale values (for flip state) from current element
        const elementScaleX = element.scaleX !== undefined ? element.scaleX : 1;
        const elementScaleY = element.scaleY !== undefined ? element.scaleY : 1;
        const signX = elementScaleX < 0 ? -1 : 1;
        const signY = elementScaleY < 0 ? -1 : 1;

        // Get original dimensions from element (not node, as node may be scaled)
        const originalWidth = element.width || 100;
        const originalHeight = element.height || 100;

        // Calculate new dimensions based on absolute scale from transformer
        // The transformer applies scale multiplicatively, so we use the absolute value
        const newWidth = Math.max(5, originalWidth * Math.abs(scaleX));
        const newHeight = Math.max(5, originalHeight * Math.abs(scaleY));

        // Reset node scale to preserve flip state
        node.scaleX(signX);
        node.scaleY(signY);

        // For images, convert adjusted position back to stored position
        const nodeX = node.x();
        const nodeY = node.y();
        // Reverse the adjustment we apply during render
        const topLeftX = nodeX - (signX < 0 ? newWidth : 0);
        const topLeftY = nodeY - (signY < 0 ? newHeight : 0);

        const newAttrs = {
          x: topLeftX,
          y: topLeftY,
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
          scaleX: signX,
          scaleY: signY,
          // Preserve opacity and other properties
          opacity: element.opacity !== undefined ? element.opacity : 1,
        };
        const updatedElements = prevElements.map((el) =>
          el.id === id ? { ...el, ...newAttrs } : el,
        );
        saveHistory(updatedElements);

        // Force transformer to update with new bounds
        if (transformerRef.current) {
          setTimeout(() => {
            const updatedNode = stageRef.current?.findOne(`#${id}`);
            if (updatedNode && transformerRef.current) {
              transformerRef.current.nodes([updatedNode]);
              transformerRef.current.forceUpdate();
              layerRef.current?.batchDraw();
            }
          }, 0);
        }

        return updatedElements;
      } else {
        // For non-image elements, use the standard approach
        node.scaleX(1);
        node.scaleY(1);

        const newAttrs = {
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          rotation: node.rotation(),
          // Preserve opacity and other properties
          opacity: element.opacity !== undefined ? element.opacity : 1,
        };
        const updatedElements = prevElements.map((el) =>
          el.id === id ? { ...el, ...newAttrs } : el,
        );
        saveHistory(updatedElements);
        return updatedElements;
      }
    });
  };

  const getSelectedElement = () => elements.find((el) => el.id === selectedId);

  const updateSelectedElement = (prop, value, skipHistory = false) => {
    if (!selectedId) return;
    setElements((prevElements) => {
      const newElements = prevElements.map((el) => {
        if (el.id === selectedId) {
          return { ...el, [prop]: value };
        }
        return el;
      });
      if (!skipHistory) {
        saveHistory(newElements);
      }
      return newElements;
    });
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(2, prev + 0.1));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.25, prev - 0.1));
  };

  const handleZoomInputChange = (e) => {
    setZoomInputValue(e.target.value);
  };

  const handleZoomInputBlur = () => {
    setIsEditingZoom(false);
    const numValue = parseFloat(zoomInputValue);
    if (!isNaN(numValue) && numValue > 0) {
      const percentage = Math.max(25, Math.min(200, numValue));
      setScale(percentage / 100);
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
    setZoomInputValue(Math.round(scale * 100).toString());
  };

  return (
    <div className="h-full flex flex-col bg-[#f0f4f8] text-gray-800">
      {/* Toolbar */}
      <div
        className="bg-white p-2 flex items-center gap-2 border-b border-gray-200 relative z-50 flex-shrink-0 overflow-x-auto shadow-sm"
        style={{ pointerEvents: "auto", minHeight: "48px" }}
      >
        <button
          onClick={handleAddText}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600 hover:text-[#3834A8]"
          title="Add Text"
          style={{ pointerEvents: "auto" }}
        >
          <Type />
        </button>
        <button
          onClick={handleAddRect}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600 hover:text-[#3834A8]"
          title="Add Rectangle"
        >
          <RectangleHorizontal />
        </button>
        <button
          onClick={handleAddCircle}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600 hover:text-[#3834A8]"
          title="Add Circle"
        >
          <CircleIcon />
        </button>
        <button
          onClick={handleAddStar}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600 hover:text-[#3834A8]"
          title="Add Star"
        >
          <StarIcon />
        </button>
        <button
          onClick={handleAddLine}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600 hover:text-[#3834A8]"
          title="Add Line"
        >
          <Minus />
        </button>
        <button
          onClick={handleAddArrow}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600 hover:text-[#3834A8]"
          title="Add Arrow"
        >
          <ArrowRight />
        </button>
        <button
          onClick={() => {
            setDrawingMode(drawingMode === "pen" ? null : "pen");
            setSelectedId(null);
          }}
          className={`p-2 hover:bg-gray-100 rounded text-gray-600 ${
            drawingMode === "pen" ? "bg-[#3834A8] text-white" : ""
          }`}
          title="Freeform Drawing (Pen)"
        >
          <Pen />
        </button>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 hover:bg-gray-100 rounded relative text-gray-600 hover:text-[#3834A8]"
          title="Add Emoji"
        >
          <Smile />
        </button>
        <button
          onClick={() => fileUploadRef.current.click()}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600 hover:text-[#3834A8]"
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
        <div className="w-px h-6 bg-gray-200 mx-2"></div>
        {/* Element Controls */}
        <button
          onClick={handleCopy}
          disabled={!selectedId && selectedIds.length === 0}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 text-gray-600 hover:text-[#3834A8]"
          title="Copy (Ctrl+C)"
        >
          <Copy size={18} />
        </button>
        <button
          onClick={handlePaste}
          disabled={copiedElements.length === 0}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 text-gray-600 hover:text-[#3834A8]"
          title="Paste (Ctrl+V)"
        >
          <Clipboard size={18} />
        </button>
        <button
          onClick={handleDuplicateElement}
          disabled={!selectedId && selectedIds.length === 0}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 text-gray-600 hover:text-[#3834A8]"
          title="Duplicate"
        >
          <Copy size={18} />
        </button>
        <button
          onClick={handleBringToFront}
          disabled={!selectedId}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 text-gray-600 hover:text-[#3834A8]"
          title="Bring to Front"
        >
          <MoveUp />
        </button>
        <button
          onClick={handleSendToBack}
          disabled={!selectedId}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 text-gray-600 hover:text-[#3834A8]"
          title="Send to Back"
        >
          <MoveDown />
        </button>
        <button
          onClick={handleToggleLock}
          disabled={!selectedId}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 text-gray-600 hover:text-[#3834A8]"
          title="Lock/Unlock"
        >
          {selectedId && elements.find((el) => el.id === selectedId)?.locked ? (
            <Lock />
          ) : (
            <Unlock />
          )}
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2"></div>
        <button
          onClick={() => csvUploadRef.current.click()}
          className={`p-2 rounded relative ${
            csvData.length > 0
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
          title="Upload CSV for Batch Generation"
        >
          <Upload />
          {csvData.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#3834A8] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {csvData.length}
            </span>
          )}
        </button>
        {csvData.length > 0 && (
          <button
            onClick={() => setShowCsvFieldsPanel(!showCsvFieldsPanel)}
            className={`p-2 rounded text-gray-600 ${
              showCsvFieldsPanel
                ? "bg-[#3834A8] text-white"
                : "hover:bg-gray-100"
            }`}
            title="Toggle CSV Fields Panel"
          >
            <Database />
          </button>
        )}
        {csvData.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs text-gray-500">Display:</span>
              <button
                onClick={() => setShowActualData(!showActualData)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showActualData
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                title={
                  showActualData
                    ? "Switch to placeholder mode"
                    : "Switch to actual data mode"
                }
              >
                {showActualData ? "Actual Data" : "Placeholder"}
              </button>
              {showActualData && csvData.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setPreviewRecordIndex(Math.max(0, previewRecordIndex - 1))
                    }
                    disabled={previewRecordIndex === 0}
                    className="px-2 py-1 bg-[#3834A8] hover:bg-[#2A1B5D] disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-xs"
                    title="Previous record"
                  >
                    ←
                  </button>
                  <span className="text-xs text-gray-500 px-1">
                    {previewRecordIndex + 1}/{csvData.length}
                  </span>
                  <button
                    onClick={() =>
                      setPreviewRecordIndex(
                        Math.min(csvData.length - 1, previewRecordIndex + 1),
                      )
                    }
                    disabled={previewRecordIndex === csvData.length - 1}
                    className="px-2 py-1 bg-[#3834A8] hover:bg-[#2A1B5D] disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-xs"
                    title="Next record"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        <input
          type="file"
          ref={csvUploadRef}
          onChange={handleCsvUpload}
          className="hidden"
          accept=".csv"
        />
        <div className="w-px h-6 bg-gray-200 mx-2"></div>
        <button
          onClick={handleDelete}
          disabled={!selectedId}
          className="p-2 hover:bg-red-100 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-gray-600 hover:text-red-500"
          title="Delete"
          style={{ pointerEvents: "auto" }}
        >
          <Trash2 />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2"></div>
        <button
          onClick={handleUndo}
          disabled={historyStep === 0}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-gray-600 hover:text-[#3834A8]"
          title="Undo"
          style={{ pointerEvents: "auto" }}
        >
          <Undo />
        </button>
        <button
          onClick={handleRedo}
          disabled={historyStep === history.length - 1}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-gray-600 hover:text-[#3834A8]"
          title="Redo"
          style={{ pointerEvents: "auto" }}
        >
          <Redo />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2"></div>
        {/* Zoom Controls */}
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600 hover:text-[#3834A8]"
          title="Zoom Out (Ctrl/Cmd + -)"
          style={{ pointerEvents: "auto" }}
        >
          <ZoomOut size={18} />
        </button>
        {isEditingZoom ? (
          <input
            type="text"
            value={zoomInputValue}
            onChange={handleZoomInputChange}
            onBlur={handleZoomInputBlur}
            onKeyDown={handleZoomInputKeyDown}
            onFocus={handleZoomInputFocus}
            className="w-16 px-2 py-1 bg-gray-100 border border-gray-200 rounded text-sm text-center text-gray-800 focus:outline-none focus:border-[#3834A8]"
            autoFocus
          />
        ) : (
          <span
            onClick={handleZoomInputFocus}
            className="px-2 py-1 text-sm text-gray-600 min-w-[60px] text-center cursor-text hover:bg-gray-100 rounded"
            title="Click to edit zoom percentage"
          >
            {Math.round(scale * 100)}%
          </span>
        )}
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded cursor-pointer text-gray-600 hover:text-[#3834A8]"
          title="Zoom In (Ctrl/Cmd + +)"
          style={{ pointerEvents: "auto" }}
        >
          <ZoomIn size={18} />
        </button>
        <div className="flex-grow"></div>
        <button
          onClick={handlePreview}
          className="p-2 bg-purple-500 hover:bg-purple-600 rounded flex items-center gap-2 mr-2 cursor-pointer text-white"
          title="Preview"
          style={{ pointerEvents: "auto" }}
        >
          <Eye /> Preview
        </button>

        {/* Upload to Blockchain Dropdown */}
        <div className="relative mr-2" style={{ zIndex: 100 }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isUploading) {
                setShowUploadMenu(!showUploadMenu);
              }
            }}
            disabled={isUploading || creditCheckLoading}
            className="p-2 bg-green-500 hover:bg-green-600 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all text-white"
            title={
              isUploading
                ? "Uploading..."
                : creditCheckLoading
                  ? "Checking credits..."
                  : "Upload to Blockchain"
            }
            style={{ pointerEvents: "auto", position: "relative", zIndex: 101 }}
            type="button"
            ref={uploadMenuButtonRef}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <CloudUpload /> Upload to Blockchain
              </>
            )}
          </button>

          {showUploadMenu && !isUploading && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0"
                onClick={() => setShowUploadMenu(false)}
                style={{ pointerEvents: "auto", zIndex: 99 }}
              />

              {/* Dropdown Menu - Use portal to escape all container constraints */}
              {(() => {
                const button = uploadMenuButtonRef.current;
                if (!button) return null;
                const rect = button.getBoundingClientRect();
                const dropdownContent = (
                  <div
                    className="fixed w-64 bg-white border border-gray-200 rounded-lg shadow-2xl z-[100] overflow-hidden"
                    style={{
                      pointerEvents: "auto",
                      top: `${rect.bottom + 8}px`,
                      right: `${window.innerWidth - rect.right}px`,
                    }}
                  >
                    {csvData.length > 0 ? (
                      <>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <p className="text-xs text-gray-600 font-semibold">
                            Upload Options ({csvData.length} records)
                          </p>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.nativeEvent?.stopImmediatePropagation?.();
                            try {
                              setShowUploadMenu(false);
                              // Small delay to ensure menu closes before credit check
                              await new Promise((resolve) =>
                                setTimeout(resolve, 50),
                              );
                              await checkCreditsAndExecute(
                                "uploadToBlockChain",
                                csvData.length,
                                handleUploadBatchToBlockchain,
                              );
                            } catch (error) {
                              console.error(
                                "Error in upload batch click:",
                                error,
                              );
                              const errorMessage =
                                error?.message ||
                                error?.toString() ||
                                "Unknown error";
                              showToast.error(
                                `Failed to initiate upload: ${errorMessage}`,
                              );
                            }
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-100 cursor-pointer"
                          type="button"
                          style={{ pointerEvents: "auto" }}
                        >
                          <CloudUpload
                            size={18}
                            className="text-green-500 mt-0.5 flex-shrink-0"
                          />
                          <div>
                            <p className="text-[#2A1B5D] font-medium text-sm">
                              Upload as Batch (
                              {CREDIT_COSTS.uploadToBlockChain * csvData.length}{" "}
                              credits)
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              Upload {csvData.length} PDFs as a single batch
                              with Merkle tree
                            </p>
                          </div>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent?.stopImmediatePropagation?.();
                          try {
                            setShowUploadMenu(false);
                            // Small delay to ensure menu closes before credit check
                            await new Promise((resolve) =>
                              setTimeout(resolve, 50),
                            );
                            await checkCreditsAndExecute(
                              "uploadToBlockChain",
                              1,
                              () => {
                                handleUploadToBlockchain();
                              },
                            );
                          } catch (error) {
                            console.error("Error in upload click:", error);
                            const errorMessage =
                              error?.message ||
                              error?.toString() ||
                              "Unknown error";
                            showToast.error(
                              `Failed to initiate upload: ${errorMessage}`,
                            );
                          }
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer"
                        type="button"
                        style={{ pointerEvents: "auto" }}
                      >
                        <CloudUpload
                          size={18}
                          className="text-green-500 mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="text-[#2A1B5D] font-medium text-sm">
                            Upload to Blockchain (
                            {CREDIT_COSTS.uploadToBlockChain} credits)
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            Upload PDF directly to IPFS and blockchain
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                );
                return createPortal(dropdownContent, document.body);
              })()}
            </>
          )}
        </div>

        {/* Export PDF Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-2 bg-[#3834A8] hover:bg-[#2A1B5D] rounded flex items-center gap-2 cursor-pointer text-white"
            title="Export PDF Options"
            style={{ pointerEvents: "auto" }}
          >
            <Download /> Export PDF
          </button>

          {showExportMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0"
                onClick={() => setShowExportMenu(false)}
                style={{ pointerEvents: "auto", zIndex: 40 }}
              />

              {/* Dropdown Menu */}
              <div
                className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden"
                style={{ pointerEvents: "auto" }}
              >
                {csvData.length > 0 ? (
                  <>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs text-gray-600 font-semibold">
                        Export Options ({csvData.length} records)
                      </p>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          setShowExportMenu(false);
                          await checkCreditsAndExecute(
                            "generatePDF",
                            csvData.length,
                            handleExportAllPDFs,
                          );
                        } catch (error) {
                          console.error(
                            "Error in export all PDFs click:",
                            error,
                          );
                          const errorMessage =
                            error?.message ||
                            error?.toString() ||
                            "Unknown error";
                          showToast.error(
                            `Failed to initiate export: ${errorMessage}`,
                          );
                        }
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-100 cursor-pointer"
                      type="button"
                      style={{ pointerEvents: "auto" }}
                    >
                      <Download
                        size={18}
                        className="text-green-500 mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-[#2A1B5D] font-medium text-sm">
                          Separate Files (
                          {CREDIT_COSTS.generatePDF * csvData.length} credits)
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {csvData.length} individual PDF files
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          setShowExportMenu(false);
                          await checkCreditsAndExecute(
                            "generatePDF",
                            csvData.length,
                            handleExportAllAsSinglePDF,
                          );
                        } catch (error) {
                          console.error(
                            "Error in export single PDF click:",
                            error,
                          );
                          const errorMessage =
                            error?.message ||
                            error?.toString() ||
                            "Unknown error";
                          showToast.error(
                            `Failed to initiate export: ${errorMessage}`,
                          );
                        }
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer"
                      type="button"
                      style={{ pointerEvents: "auto" }}
                    >
                      <Download
                        size={18}
                        className="text-[#3834A8] mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-[#2A1B5D] font-medium text-sm">
                          Single File (
                          {CREDIT_COSTS.generatePDF * csvData.length} credits)
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          1 PDF with {csvData.length} pages
                        </p>
                      </div>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        setShowExportMenu(false);
                        await checkCreditsAndExecute("generatePDF", 1, () => {
                          handleExportPDF();
                        });
                      } catch (error) {
                        console.error("Error in export PDF click:", error);
                        const errorMessage =
                          error?.message ||
                          error?.toString() ||
                          "Unknown error";
                        showToast.error(
                          `Failed to initiate export: ${errorMessage}`,
                        );
                      }
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer"
                    type="button"
                    style={{ pointerEvents: "auto" }}
                  >
                    <Download
                      size={18}
                      className="text-[#3834A8] mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-[#2A1B5D] font-medium text-sm">
                        Export Template ({CREDIT_COSTS.generatePDF} credits)
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
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

      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas Area - Full Screen */}
        <div
          className="konva-canvas-container flex-1 flex items-center justify-center bg-gray-200 p-4 overflow-auto relative"
          onDragOver={handleStageDragOver}
          onDrop={handleStageDropField}
          onWheel={(e) => {
            // Zoom with Ctrl/Cmd + wheel
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.1 : 0.1;
              setScale((prev) => {
                const newScale = prev + delta;
                return Math.max(0.25, Math.min(2, newScale));
              });
            }
          }}
        >
          <div
            className="bg-white shadow-2xl"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            <Stage
              width={STAGE_WIDTH}
              height={STAGE_HEIGHT}
              onMouseDown={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (
                  clickedOnEmpty &&
                  !e.evt.ctrlKey &&
                  !e.evt.metaKey &&
                  !e.evt.shiftKey &&
                  drawingMode !== "pen"
                ) {
                  // Start selection box
                  const pos = e.target.getPointerPosition();
                  setIsSelecting(true);
                  setSelectionBox({
                    x1: pos.x,
                    y1: pos.y,
                    x2: pos.x,
                    y2: pos.y,
                  });
                  setSelectedId(null);
                  setSelectedIds([]);
                }
                checkDeselect(e);
                handleMouseDown(e);
              }}
              onMouseMove={(e) => {
                if (isSelecting && selectionBox) {
                  // Always get position from stage, not from target (which might be an element)
                  const stage = e.target.getStage();
                  const pos = stage.getPointerPosition();

                  setSelectionBox({
                    ...selectionBox,
                    x2: pos.x,
                    y2: pos.y,
                  });

                  // Select elements within selection box
                  const box = {
                    x: Math.min(selectionBox.x1, pos.x),
                    y: Math.min(selectionBox.y1, pos.y),
                    width: Math.abs(pos.x - selectionBox.x1),
                    height: Math.abs(pos.y - selectionBox.y1),
                  };

                  // Only select if box has meaningful size (avoid accidental selections)
                  if (box.width > 5 && box.height > 5) {
                    const selected = elements.filter((el) => {
                      const shape = stage.findOne(`#${el.id}`);
                      if (!shape || el.locked) return false;
                      const shapeBox = shape.getClientRect();
                      // Check if shape intersects with selection box
                      return (
                        shapeBox.x < box.x + box.width &&
                        shapeBox.x + shapeBox.width > box.x &&
                        shapeBox.y < box.y + box.height &&
                        shapeBox.y + shapeBox.height > box.y
                      );
                    });

                    if (selected.length > 0) {
                      const ids = selected.map((el) => el.id);
                      setSelectedIds(ids);
                      setSelectedId(ids[0] || null);
                    }
                  }

                  // Prevent elements from interfering with selection
                  e.cancelBubble = true;
                } else {
                  handleMouseMove(e);
                }
              }}
              onMouseUp={(e) => {
                if (isSelecting) {
                  setIsSelecting(false);
                  setSelectionBox(null);
                }
                handleMouseUp(e);
              }}
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
                    draggable: !el.locked && !isSelecting, // Disable dragging during selection
                    listening: !isSelecting, // Disable listening during selection to prevent interference
                    onClick: (e) => {
                      if (!isSelecting) {
                        handleElementClick(e, el.id);
                      }
                    },
                    onTap: (e) => {
                      if (!isSelecting) {
                        handleElementClick(e, el.id);
                      }
                    },
                    onDragEnd: (e) => handleDragEnd(e, el.id),
                    onTransformEnd: (e) => {
                      // Skip transform end during programmatic transforms
                      if (!isProgrammaticTransform.current) {
                        handleTransformEnd(e, el.id);
                      }
                    },
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
                        cornerRadius={el.cornerRadius || 0}
                        dash={el.dashEnabled ? el.dash || [5, 5] : null}
                        scaleX={el.scaleX || 1}
                        scaleY={el.scaleY || 1}
                        skewX={el.skewX || 0}
                        skewY={el.skewY || 0}
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
                        dash={el.dashEnabled ? el.dash || [5, 5] : null}
                        scaleX={el.scaleX || 1}
                        scaleY={el.scaleY || 1}
                        skewX={el.skewX || 0}
                        skewY={el.skewY || 0}
                      />
                    );
                  }
                  if (el.type === "text") {
                    // Apply text transform
                    let displayText = el.text || "Text";

                    // Handle dynamic elements: show placeholder or actual data based on mode
                    if (el.isDynamic && el.dataField) {
                      if (showActualData && csvData.length > 0) {
                        // Actual Data Mode: Replace placeholder with actual CSV value
                        const currentRecord =
                          csvData[previewRecordIndex] || csvData[0];
                        const actualValue = currentRecord[el.dataField];
                        if (actualValue !== undefined && actualValue !== null) {
                          // Replace {{fieldName}} pattern with actual value
                          displayText = displayText.replace(
                            new RegExp(`\\{\\{${el.dataField}\\}\\}`, "g"),
                            String(actualValue),
                          );
                          // If the text is just the placeholder pattern, replace the whole thing
                          const trimmedText = displayText.trim();
                          if (
                            trimmedText === `{{${el.dataField}}}` ||
                            trimmedText === el.dataField
                          ) {
                            displayText = String(actualValue);
                          }
                        } else {
                          // If value is missing, show placeholder with indicator
                          displayText = displayText.replace(
                            new RegExp(`\\{\\{${el.dataField}\\}\\}`, "g"),
                            `[${el.dataField} - missing]`,
                          );
                        }
                      } else {
                        // Placeholder Mode: Always show {{fieldName}} for dynamic elements
                        // This ensures designers can see the variable names while designing
                        // Replace any actual values with the placeholder format
                        if (csvData.length > 0) {
                          const firstRecord = csvData[0];
                          const actualValue = firstRecord[el.dataField];
                          // If current text matches an actual value, show placeholder instead
                          if (
                            actualValue !== undefined &&
                            actualValue !== null &&
                            displayText === String(actualValue)
                          ) {
                            displayText = `{{${el.dataField}}}`;
                          } else {
                            // Replace {{fieldName}} pattern if it exists, or ensure it's present
                            if (displayText.includes(`{{${el.dataField}}}`)) {
                              // Already has placeholder, keep it
                            } else if (displayText.trim() === el.dataField) {
                              // Just the field name, add braces
                              displayText = `{{${el.dataField}}}`;
                            } else {
                              // Mixed text - replace any actual value occurrences with placeholder
                              displayText = displayText.replace(
                                new RegExp(
                                  String(actualValue).replace(
                                    /[.*+?^${}()|[\]\\]/g,
                                    "\\$&",
                                  ),
                                  "g",
                                ),
                                `{{${el.dataField}}}`,
                              );
                            }
                          }
                        } else {
                          // No CSV data yet, ensure placeholder format is shown
                          if (!displayText.includes(`{{${el.dataField}}}`)) {
                            if (displayText.trim() === el.dataField) {
                              displayText = `{{${el.dataField}}}`;
                            }
                          }
                        }
                      }
                    }

                    if (el.textTransform === "uppercase") {
                      displayText = displayText.toUpperCase();
                    } else if (el.textTransform === "lowercase") {
                      displayText = displayText.toLowerCase();
                    } else if (el.textTransform === "capitalize") {
                      displayText = displayText.replace(/\b\w/g, (l) =>
                        l.toUpperCase(),
                      );
                    }

                    return (
                      <Text
                        {...commonProps}
                        text={displayText}
                        fontSize={el.fontSize}
                        fontFamily={el.fontFamily || "Arial"}
                        fontStyle={el.fontStyle || "normal"}
                        fontWeight={el.fontWeight || "normal"}
                        textDecoration={el.textDecoration || ""}
                        align={el.align || "left"}
                        fill={el.fill}
                        opacity={el.opacity !== undefined ? el.opacity : 1}
                        rotation={el.rotation}
                        width={el.width} // Important for alignment
                        lineHeight={el.lineHeight || 1.2}
                        letterSpacing={el.letterSpacing || 0}
                        shadowColor={
                          el.shadowEnabled ? el.shadowColor || "#000000" : null
                        }
                        shadowBlur={el.shadowEnabled ? el.shadowBlur || 5 : 0}
                        shadowOffsetX={
                          el.shadowEnabled ? el.shadowOffsetX || 0 : 0
                        }
                        shadowOffsetY={
                          el.shadowEnabled ? el.shadowOffsetY || 0 : 0
                        }
                        scaleX={el.scaleX || 1}
                        scaleY={el.scaleY || 1}
                        skewX={el.skewX || 0}
                        skewY={el.skewY || 0}
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

                          // Calculate the exact screen position accounting for canvas scale
                          const areaPosition = {
                            x: stageBox.left + textPosition.x * scale,
                            y: stageBox.top + textPosition.y * scale,
                          };

                          const textarea = document.createElement("textarea");
                          document.body.appendChild(textarea);

                          // Set initial value and basic styles
                          textarea.value = textNode.text();
                          textarea.style.position = "absolute";
                          textarea.style.top = areaPosition.y + "px";
                          textarea.style.left = areaPosition.x + "px";

                          // Set minimum width based on text node, accounting for scale
                          const minWidth = Math.max(
                            textNode.width() || 200,
                            100,
                          );
                          textarea.style.width = minWidth * scale + "px";
                          textarea.style.minHeight =
                            textNode.fontSize() * scale + "px";

                          // Apply scale to font size to match visual appearance
                          textarea.style.fontSize =
                            textNode.fontSize() * scale + "px";
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
                          textarea.style.border = "2px solid #4A70A9";
                          textarea.style.background =
                            "rgba(255, 255, 255, 0.95)";
                          textarea.style.outline = "none";
                          textarea.style.resize = "none";
                          textarea.style.overflow = "hidden";
                          textarea.style.transformOrigin = "left top";
                          textarea.style.zIndex = "10000";

                          // Handle rotation and scale together
                          const rotation = textNode.rotation();
                          if (rotation) {
                            textarea.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                          } else {
                            textarea.style.transform = `scale(${scale})`;
                          }

                          // Auto-resize height
                          textarea.style.height = "auto";
                          textarea.style.height = textarea.scrollHeight + "px";

                          textarea.focus();
                          textarea.select();

                          let outsideClickTimeoutId = null;
                          let isTextareaRemoved = false;

                          function removeTextarea() {
                            if (!textarea.parentNode) return;
                            isTextareaRemoved = true;
                            if (outsideClickTimeoutId) {
                              clearTimeout(outsideClickTimeoutId);
                              outsideClickTimeoutId = null;
                            }

                            const finalText = textarea.value;
                            textarea.parentNode.removeChild(textarea);
                            window.removeEventListener(
                              "click",
                              handleOutsideClick,
                            );

                            // Update text content but maintain position
                            // handleElementChange now saves history automatically
                            handleElementChange(el.id, {
                              text: finalText,
                              x: originalX, // Explicitly maintain position
                              y: originalY,
                            });

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
                          outsideClickTimeoutId = setTimeout(() => {
                            if (isTextareaRemoved) return;
                            window.addEventListener(
                              "click",
                              handleOutsideClick,
                            );
                          }, 100);
                        }}
                      />
                    );
                  }
                  if (el.type === "image") {
                    // Create a component that handles image loading properly
                    const ImageElement = () => {
                      const [imageObj, setImageObj] = React.useState(null);

                      React.useEffect(() => {
                        // If we already have an image object that's loaded, use it
                        if (
                          el.image &&
                          el.image.complete &&
                          el.image.naturalWidth > 0
                        ) {
                          setImageObj(el.image);
                          return;
                        }

                        // Otherwise, load from src
                        if (el.src) {
                          const img = new window.Image();
                          img.crossOrigin = "anonymous";
                          img.onload = () => {
                            setImageObj(img);
                          };
                          img.onerror = () => {
                            console.error("Failed to load image:", el.src);
                          };
                          img.src = el.src;
                        } else if (el.image) {
                          // Image object exists but might not be loaded yet
                          if (el.image.complete && el.image.naturalWidth > 0) {
                            setImageObj(el.image);
                          } else {
                            const img = el.image;
                            img.onload = () => {
                              setImageObj(img);
                            };
                            // If already has src, trigger load
                            if (img.src) {
                              img.src = img.src;
                            }
                          }
                        }
                      }, [el.src, el.image]);

                      if (!imageObj) {
                        return null; // Don't render until image is loaded
                      }

                      const imageWidth = el.width || 100;
                      const imageHeight = el.height || 100;
                      const scaleX = el.scaleX !== undefined ? el.scaleX : 1;
                      const scaleY = el.scaleY !== undefined ? el.scaleY : 1;

                      // Calculate position adjustment for flipping
                      // When scaleX is negative, image flips around left edge, so we need to shift right by width
                      // When scaleY is negative, image flips around top edge, so we need to shift down by height
                      const adjustedX = el.x + (scaleX < 0 ? imageWidth : 0);
                      const adjustedY = el.y + (scaleY < 0 ? imageHeight : 0);

                      return (
                        <Image
                          {...commonProps}
                          image={imageObj}
                          x={adjustedX}
                          y={adjustedY}
                          width={imageWidth}
                          height={imageHeight}
                          rotation={el.rotation || 0}
                          opacity={el.opacity !== undefined ? el.opacity : 1}
                          scaleX={scaleX}
                          scaleY={scaleY}
                        />
                      );
                    };

                    return <ImageElement key={el.id} />;
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

                {/* Selection Box */}
                {isSelecting && selectionBox && (
                  <Rect
                    x={Math.min(selectionBox.x1, selectionBox.x2)}
                    y={Math.min(selectionBox.y1, selectionBox.y2)}
                    width={Math.abs(selectionBox.x2 - selectionBox.x1)}
                    height={Math.abs(selectionBox.y2 - selectionBox.y1)}
                    fill="rgba(74, 112, 169, 0.12)"
                    stroke="#4A70A9"
                    strokeWidth={1}
                    dash={[5, 5]}
                  />
                )}

                <Transformer
                  ref={transformerRef}
                  rotateEnabled={true}
                  borderEnabled={true}
                  anchorSize={8}
                  anchorStrokeWidth={2}
                />
              </Layer>
            </Stage>
          </div>
        </div>

        {/* CSV Fields Panel - Floating when CSV is loaded */}
        {showCsvFieldsPanel && csvFields.length > 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white border-2 border-[#3834A8] rounded-lg shadow-2xl p-4 z-50 max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[#2A1B5D]">
                <Database className="w-5 h-5 text-[#3834A8]" />
                CSV Fields ({csvData.length} records)
              </h3>
              <button
                onClick={() => setShowCsvFieldsPanel(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                title="Close Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
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
                        : "bg-[#3834A8] hover:bg-[#2A1B5D] text-white hover:scale-105"
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

        {/* Properties Panel - Collapsible */}
        {showPropertiesPanel && (
          <div className="w-80 bg-white p-4 border-l border-gray-200 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#2A1B5D]">Properties</h3>
              <button
                onClick={() => setShowPropertiesPanel(false)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Hide Properties Panel"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            {selectedId && getSelectedElement() ? (
              <div className="space-y-4">
                {/* Fill Color */}
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Fill Color
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="color"
                      value={
                        getSelectedElement().fill === "transparent"
                          ? "#000000"
                          : getSelectedElement().fill || "#000000"
                      }
                      onChange={(e) =>
                        updateSelectedElement("fill", e.target.value)
                      }
                      className="flex-1 h-10 p-1 bg-gray-100 border border-gray-300 rounded cursor-pointer"
                    />
                    <button
                      onClick={() =>
                        updateSelectedElement("fill", "transparent")
                      }
                      className={`px-3 py-2 rounded border text-sm transition-colors ${
                        getSelectedElement().fill === "transparent"
                          ? "bg-[#3834A8] border-[#3834A8] text-white"
                          : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                      }`}
                      title="No Fill (Transparent) - Only border will be visible"
                    >
                      No Fill
                    </button>
                  </div>
                  {getSelectedElement().fill === "transparent" ? (
                    <div className="flex items-center gap-2 px-2 py-1 bg-[#3834A8]/10 border border-[#3834A8]/30 rounded text-xs text-[#3834A8]">
                      <span>✓</span>
                      <span>Only border will be visible</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Click "No Fill" to show only border
                    </p>
                  )}
                </div>

                {/* Opacity for shapes, circles, and images */}
                {(getSelectedElement().type === "rect" ||
                  getSelectedElement().type === "circle" ||
                  getSelectedElement().type === "image") && (
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">
                      Opacity:{" "}
                      {Math.round(
                        (getSelectedElement()?.opacity !== undefined
                          ? getSelectedElement().opacity
                          : 1) * 100,
                      )}
                      %
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={
                        getSelectedElement()?.opacity !== undefined
                          ? getSelectedElement().opacity
                          : 1
                      }
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        setElements((prevElements) => {
                          return prevElements.map((el) =>
                            el.id === selectedId
                              ? { ...el, opacity: newValue }
                              : el,
                          );
                        });
                      }}
                      onMouseUp={() => {
                        // State is already updated by onChange, just save current state to history
                        setElements((prevElements) => {
                          saveHistory(prevElements);
                          return prevElements; // Return unchanged state, just trigger saveHistory
                        });
                      }}
                      onTouchEnd={() => {
                        // State is already updated by onChange, just save current state to history
                        setElements((prevElements) => {
                          saveHistory(prevElements);
                          return prevElements; // Return unchanged state, just trigger saveHistory
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Border/Stroke for shapes and circles */}
                {(getSelectedElement().type === "rect" ||
                  getSelectedElement().type === "circle") && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Border Color
                      </label>
                      <input
                        type="color"
                        value={getSelectedElement().stroke || "#000000"}
                        onChange={(e) =>
                          updateSelectedElement("stroke", e.target.value)
                        }
                        className="w-full h-10 p-1 bg-gray-100 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Border Width
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={getSelectedElement().strokeWidth || 0}
                        onChange={(e) =>
                          updateSelectedElement(
                            "strokeWidth",
                            parseInt(e.target.value, 10),
                          )
                        }
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-800"
                      />
                    </div>

                    {/* Border Dash Array (Dashed Border) */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={getSelectedElement().dashEnabled || false}
                          onChange={(e) =>
                            updateSelectedElement(
                              "dashEnabled",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4"
                        />
                        <span>Dashed Border</span>
                      </label>
                      {getSelectedElement().dashEnabled && (
                        <div className="mt-2 space-y-2">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">
                              Dash Length:{" "}
                              {getSelectedElement().dash || [5, 5]?.[0] || 5}
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="50"
                              step="1"
                              value={getSelectedElement().dash?.[0] || 5}
                              onChange={(e) => {
                                const dash = getSelectedElement().dash || [
                                  5, 5,
                                ];
                                updateSelectedElement("dash", [
                                  parseInt(e.target.value, 10),
                                  dash[1] || 5,
                                ]);
                              }}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">
                              Gap Length: {getSelectedElement().dash?.[1] || 5}
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="50"
                              step="1"
                              value={getSelectedElement().dash?.[1] || 5}
                              onChange={(e) => {
                                const dash = getSelectedElement().dash || [
                                  5, 5,
                                ];
                                updateSelectedElement("dash", [
                                  dash[0] || 5,
                                  parseInt(e.target.value, 10),
                                ]);
                              }}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Corner Radius for Rectangles */}
                    {getSelectedElement().type === "rect" && (
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">
                          Corner Radius:{" "}
                          {getSelectedElement().cornerRadius || 0}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={getSelectedElement().cornerRadius || 0}
                          onChange={(e) =>
                            updateSelectedElement(
                              "cornerRadius",
                              parseInt(e.target.value, 10),
                            )
                          }
                          className="w-full"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Font Size for text */}
                {getSelectedElement().type === "text" && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Font Size
                      </label>
                      <input
                        type="number"
                        value={getSelectedElement().fontSize}
                        onChange={(e) =>
                          updateSelectedElement(
                            "fontSize",
                            parseInt(e.target.value, 10),
                          )
                        }
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-800"
                      />
                    </div>

                    {/* Font Family */}
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Font Family
                      </label>
                      <select
                        value={getSelectedElement().fontFamily || "Arial"}
                        onChange={(e) =>
                          updateSelectedElement("fontFamily", e.target.value)
                        }
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-800"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Arial Black">Arial Black</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Impact">Impact</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Tahoma">Tahoma</option>
                        <option value="Palatino">Palatino</option>
                        <option value="Garamond">Garamond</option>
                        <option value="Bookman">Bookman</option>
                        <option value="Lucida Console">Lucida Console</option>
                        <option value="Monaco">Monaco</option>
                        <option value="Courier">Courier</option>
                      </select>
                    </div>

                    {/* Font Weight */}
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Font Weight
                      </label>
                      <select
                        value={getSelectedElement().fontWeight || "normal"}
                        onChange={(e) =>
                          updateSelectedElement("fontWeight", e.target.value)
                        }
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-800"
                      >
                        <option value="normal">Normal</option>
                        <option value="100">Thin (100)</option>
                        <option value="200">Extra Light (200)</option>
                        <option value="300">Light (300)</option>
                        <option value="400">Regular (400)</option>
                        <option value="500">Medium (500)</option>
                        <option value="600">Semi Bold (600)</option>
                        <option value="700">Bold (700)</option>
                        <option value="800">Extra Bold (800)</option>
                        <option value="900">Black (900)</option>
                      </select>
                    </div>

                    {/* Line Height */}
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Line Height: {getSelectedElement().lineHeight || 1.2}
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={getSelectedElement().lineHeight || 1.2}
                        onChange={(e) =>
                          updateSelectedElement(
                            "lineHeight",
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Letter Spacing */}
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Letter Spacing:{" "}
                        {getSelectedElement().letterSpacing || 0}px
                      </label>
                      <input
                        type="range"
                        min="-5"
                        max="20"
                        step="0.5"
                        value={getSelectedElement().letterSpacing || 0}
                        onChange={(e) =>
                          updateSelectedElement(
                            "letterSpacing",
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Text Transform */}
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Text Transform
                      </label>
                      <select
                        value={getSelectedElement().textTransform || "none"}
                        onChange={(e) =>
                          updateSelectedElement("textTransform", e.target.value)
                        }
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-800"
                      >
                        <option value="none">None</option>
                        <option value="uppercase">UPPERCASE</option>
                        <option value="lowercase">lowercase</option>
                        <option value="capitalize">Capitalize</option>
                      </select>
                    </div>

                    {/* Text Formatting Buttons */}
                    <div>
                      <label className="text-sm text-gray-600 block mb-2">
                        Text Style
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const current =
                              getSelectedElement().fontStyle || "normal";
                            updateSelectedElement(
                              "fontStyle",
                              current === "bold" ? "normal" : "bold",
                            );
                          }}
                          className={`flex-1 p-2 rounded border ${
                            getSelectedElement().fontStyle === "bold"
                              ? "bg-[#3834A8] border-[#3834A8] text-white"
                              : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700"
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
                              current === "italic" ? "" : "italic",
                            );
                          }}
                          className={`flex-1 p-2 rounded border ${
                            getSelectedElement().textDecoration === "italic"
                              ? "bg-[#3834A8] border-[#3834A8] text-white"
                              : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700"
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
                              current === "underline" ? "" : "underline",
                            );
                          }}
                          className={`flex-1 p-2 rounded border ${
                            getSelectedElement().textDecoration === "underline"
                              ? "bg-[#3834A8] border-[#3834A8] text-white"
                              : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700"
                          }`}
                          title="Underline"
                        >
                          <Underline size={18} className="mx-auto" />
                        </button>
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <label className="text-sm text-gray-600 block mb-2">
                        Text Alignment
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateSelectedElement("align", "left")}
                          className={`flex-1 p-2 rounded border ${
                            getSelectedElement().align === "left"
                              ? "bg-[#3834A8] border-[#3834A8] text-white"
                              : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700"
                          }`}
                          title="Align Left"
                        >
                          <AlignLeft size={18} className="mx-auto" />
                        </button>
                        <button
                          onClick={() =>
                            updateSelectedElement("align", "center")
                          }
                          className={`flex-1 p-2 rounded border ${
                            getSelectedElement().align === "center"
                              ? "bg-[#3834A8] border-[#3834A8] text-white"
                              : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700"
                          }`}
                          title="Align Center"
                        >
                          <AlignCenter size={18} className="mx-auto" />
                        </button>
                        <button
                          onClick={() =>
                            updateSelectedElement("align", "right")
                          }
                          className={`flex-1 p-2 rounded border ${
                            getSelectedElement().align === "right"
                              ? "bg-[#3834A8] border-[#3834A8] text-white"
                              : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700"
                          }`}
                          title="Align Right"
                        >
                          <AlignRight size={18} className="mx-auto" />
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Field Checkbox */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
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
                        <label className="text-sm text-gray-600 block mb-1">
                          CSV Field Name
                        </label>
                        <input
                          type="text"
                          value={getSelectedElement().dataField || ""}
                          onChange={(e) =>
                            updateSelectedElement("dataField", e.target.value)
                          }
                          placeholder="e.g., name, email, course"
                          className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-800 placeholder-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the exact column name from your CSV
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Text Opacity:{" "}
                        {Math.round(
                          (getSelectedElement().opacity !== undefined
                            ? getSelectedElement().opacity
                            : 1) * 100,
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
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Text Shadow */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <label className="text-sm text-gray-600 block mb-2">
                        Text Shadow
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={
                              getSelectedElement().shadowEnabled || false
                            }
                            onChange={(e) =>
                              updateSelectedElement(
                                "shadowEnabled",
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">
                            Enable Shadow
                          </span>
                        </div>
                        {getSelectedElement().shadowEnabled && (
                          <>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">
                                Shadow Color
                              </label>
                              <input
                                type="color"
                                value={
                                  getSelectedElement().shadowColor || "#000000"
                                }
                                onChange={(e) =>
                                  updateSelectedElement(
                                    "shadowColor",
                                    e.target.value,
                                  )
                                }
                                className="w-full h-8 p-1 bg-gray-100 border border-gray-300 rounded cursor-pointer"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">
                                Blur: {getSelectedElement().shadowBlur || 5}
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="50"
                                step="1"
                                value={getSelectedElement().shadowBlur || 5}
                                onChange={(e) =>
                                  updateSelectedElement(
                                    "shadowBlur",
                                    parseInt(e.target.value, 10),
                                  )
                                }
                                className="w-full"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Offset X:{" "}
                                  {getSelectedElement().shadowOffsetX || 0}
                                </label>
                                <input
                                  type="range"
                                  min="-50"
                                  max="50"
                                  step="1"
                                  value={
                                    getSelectedElement().shadowOffsetX || 0
                                  }
                                  onChange={(e) =>
                                    updateSelectedElement(
                                      "shadowOffsetX",
                                      parseInt(e.target.value, 10),
                                    )
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Offset Y:{" "}
                                  {getSelectedElement().shadowOffsetY || 0}
                                </label>
                                <input
                                  type="range"
                                  min="-50"
                                  max="50"
                                  step="1"
                                  value={
                                    getSelectedElement().shadowOffsetY || 0
                                  }
                                  onChange={(e) =>
                                    updateSelectedElement(
                                      "shadowOffsetY",
                                      parseInt(e.target.value, 10),
                                    )
                                  }
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Position Controls - Available for all elements */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <label className="text-sm text-gray-600 block mb-2 font-semibold">
                    Position
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        X
                      </label>
                      <input
                        type="number"
                        value={Math.round(getSelectedElement().x || 0)}
                        onChange={(e) =>
                          updateSelectedElement(
                            "x",
                            parseInt(e.target.value, 10),
                          )
                        }
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Y
                      </label>
                      <input
                        type="number"
                        value={Math.round(getSelectedElement().y || 0)}
                        onChange={(e) =>
                          updateSelectedElement(
                            "y",
                            parseInt(e.target.value, 10),
                          )
                        }
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-800 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Size Controls */}
                {(getSelectedElement().type === "rect" ||
                  getSelectedElement().type === "image" ||
                  getSelectedElement().type === "text") && (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <label className="text-sm text-gray-600 block mb-2 font-semibold">
                      Size
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Width
                        </label>
                        <input
                          type="number"
                          value={Math.round(getSelectedElement().width || 0)}
                          onChange={(e) =>
                            updateSelectedElement(
                              "width",
                              parseInt(e.target.value, 10),
                            )
                          }
                          className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-800 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Height
                        </label>
                        <input
                          type="number"
                          value={Math.round(getSelectedElement().height || 0)}
                          onChange={(e) =>
                            updateSelectedElement(
                              "height",
                              parseInt(e.target.value, 10),
                            )
                          }
                          className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-800 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Radius for circle */}
                {getSelectedElement().type === "circle" && (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <label className="text-sm text-gray-600 block mb-1">
                      Radius
                    </label>
                    <input
                      type="number"
                      value={getSelectedElement().radius}
                      onChange={(e) =>
                        updateSelectedElement(
                          "radius",
                          parseInt(e.target.value, 10),
                        )
                      }
                      className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                )}

                {/* Transform Controls */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <label className="text-sm text-gray-600 block mb-2 font-semibold">
                    Transform
                  </label>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Rotation:{" "}
                        {Math.round(getSelectedElement().rotation || 0)}°
                      </label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={getSelectedElement().rotation || 0}
                        onChange={(e) =>
                          updateSelectedElement(
                            "rotation",
                            parseInt(e.target.value, 10),
                          )
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Scale X:{" "}
                          {(getSelectedElement().scaleX || 1).toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-3"
                          max="3"
                          step="0.1"
                          value={getSelectedElement().scaleX || 1}
                          onChange={(e) =>
                            updateSelectedElement(
                              "scaleX",
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Scale Y:{" "}
                          {(getSelectedElement().scaleY || 1).toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-3"
                          max="3"
                          step="0.1"
                          value={getSelectedElement().scaleY || 1}
                          onChange={(e) =>
                            updateSelectedElement(
                              "scaleY",
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Skew X: {getSelectedElement().skewX || 0}°
                        </label>
                        <input
                          type="range"
                          min="-45"
                          max="45"
                          step="1"
                          value={getSelectedElement().skewX || 0}
                          onChange={(e) =>
                            updateSelectedElement(
                              "skewX",
                              parseInt(e.target.value, 10),
                            )
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Skew Y: {getSelectedElement().skewY || 0}°
                        </label>
                        <input
                          type="range"
                          min="-45"
                          max="45"
                          step="1"
                          value={getSelectedElement().skewY || 0}
                          onChange={(e) =>
                            updateSelectedElement(
                              "skewY",
                              parseInt(e.target.value, 10),
                            )
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Select an element to see its properties.
              </p>
            )}
          </div>
        )}
        {!showPropertiesPanel && (
          <button
            onClick={() => setShowPropertiesPanel(true)}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 border border-gray-200 rounded-l-lg p-2 z-10 shadow-lg"
            title="Show Properties Panel"
          >
            <span className="text-gray-500 text-sm">▶</span>
          </button>
        )}
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
                          handleExportAllPDFs,
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
                          handleExportAllAsSinglePDF,
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
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#3834A8] hover:bg-[#2A1B5D] text-white rounded-lg transition-all text-sm font-medium justify-center"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#2A1B5D]">
                CSV Data Loaded
              </h2>
              <button
                onClick={() => setShowCsvModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-[#3834A8]/10 border border-[#3834A8]/30 rounded-xl p-4 mb-4">
                <p className="text-[#3834A8] text-sm">
                  <strong>{csvData.length} records</strong> loaded from CSV
                </p>
                <p className="text-gray-600 text-xs mt-2">
                  Available fields:{" "}
                  {csvData.length > 0 && Object.keys(csvData[0]).join(", ")}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-4">
                <p className="text-yellow-700 text-sm font-semibold mb-2">
                  📋 How to use dynamic fields:
                </p>
                <ol className="text-gray-700 text-xs space-y-1 ml-4 list-decimal">
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

              <div className="max-h-60 overflow-auto bg-gray-50 rounded-lg p-3 border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="text-gray-600 border-b border-gray-300">
                    <tr>
                      {csvData.length > 0 &&
                        Object.keys(csvData[0]).map((key) => (
                          <th key={key} className="text-left p-2">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {csvData.slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-b border-gray-200">
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

            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
              >
                Close
              </button>
              <button
                onClick={handlePreviewBatch}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#3834A8] hover:bg-[#2A1B5D] text-white rounded-lg transition-all"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-[#2A1B5D]">
                  Preview Certificate Design
                </h2>
                <p className="text-sm text-gray-600">
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-4">
              <div className="h-full overflow-y-auto space-y-4">
                {/* Info Banner */}
                <div className="bg-[#3834A8]/10 border border-[#3834A8]/30 rounded-xl p-4">
                  <p className="text-[#3834A8] text-sm font-semibold mb-2">
                    📋 Preview Mode
                  </p>
                  <p className="text-gray-600 text-sm">
                    Review how your design looks with real CSV data. If
                    everything looks good, click{" "}
                    <strong>
                      "Generate All {csvData.length} Certificates"
                    </strong>{" "}
                    below.
                  </p>
                  {previewSamples.length < csvData.length && (
                    <p className="text-gray-500 text-xs mt-2">
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
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[#3834A8]/10 rounded-lg">
                          <FileText size={20} className="text-[#3834A8]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#2A1B5D] font-medium truncate">
                            {sample.recipient?.name ||
                              sample.recipient?.fullname ||
                              `Recipient ${sample.recipientNumber}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Sample #{sample.recipientNumber}
                          </p>
                        </div>
                      </div>
                      <div className="relative bg-white rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={sample.dataURL}
                          alt={`Certificate preview ${index + 1}`}
                          className="w-full h-auto"
                        />
                      </div>
                      {/* Show some data fields */}
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs border border-gray-200">
                        <p className="text-gray-500 mb-1">CSV Data:</p>
                        {Object.entries(sample.recipient)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <p key={key} className="text-gray-700">
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
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowBatchPreviewBeforeGenerate(false);
                  setPreviewSamples([]);
                  setShowCsvModal(true);
                }}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
              >
                ← Back to Design
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBatchPreviewBeforeGenerate(false);
                    setPreviewSamples([]);
                  }}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-[#2A1B5D]">
                  Batch Certificates Generated
                </h2>
                <p className="text-sm text-gray-600">
                  {batchPreviews.length} certificates ready to download
                </p>
              </div>
              <button
                onClick={closeBatchPreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-4">
              <div className="h-full overflow-y-auto space-y-3">
                <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-4">
                  <p className="text-green-700 text-sm">
                    <strong>{batchPreviews.length} certificates</strong>{" "}
                    generated successfully and ready to download
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {batchPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[#3834A8]/10 rounded-lg">
                          <FileText size={20} className="text-[#3834A8]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#2A1B5D] font-medium truncate">
                            {preview.recipient?.name ||
                              preview.recipient?.fullname ||
                              "Recipient"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {preview.filename}
                          </p>
                        </div>
                      </div>
                      <img
                        src={preview.dataURL}
                        alt={`Certificate ${index + 1}`}
                        className="w-full h-32 object-contain bg-gray-50 rounded mb-3 border border-gray-200"
                      />
                      <button
                        onClick={() =>
                          downloadBatchPDF(preview.pdf, preview.filename)
                        }
                        className="w-full flex items-center justify-center gap-2 p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors border border-green-200"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <button
                onClick={closeBatchPreview}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
              >
                Close
              </button>
              <button
                onClick={downloadAllBatchPDFs}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#3834A8] hover:bg-[#2A1B5D] text-white rounded-lg transition-all"
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
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#2A1B5D]">Select Emoji</h2>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500 hover:text-gray-700" />
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
                    className="text-3xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
        operation={pendingExportAction?.operation || "generatePDF"}
        count={pendingExportAction?.count || 1}
        currentBalance={credits}
        loading={creditCheckLoading}
      />
    </div>
  );
};

export default KonvaPdfDesigner;
