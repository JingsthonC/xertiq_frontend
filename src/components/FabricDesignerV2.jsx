import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, Textbox, Rect, Line, FabricImage } from "fabric";
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
} from "lucide-react";

const FabricDesignerV2 = ({ template, onTemplateChange }) => {
  const canvasContainerRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerDivRef = useRef(null);
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [scale, setScale] = useState(1);
  const [csvData, setCsvData] = useState([]);
  const [batchInfo, setBatchInfo] = useState({ courseName: "", batchName: "" });
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showRecipientsList, setShowRecipientsList] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // A4 dimensions in mm
  const A4_WIDTH = template.orientation === "landscape" ? 297 : 210;
  const A4_HEIGHT = template.orientation === "landscape" ? 210 : 297;

  // Canvas display size (pixels) - scale factor of 2 for better quality
  const CANVAS_SCALE = 2;
  const canvasWidth = A4_WIDTH * CANVAS_SCALE;
  const canvasHeight = A4_HEIGHT * CANVAS_SCALE;

  // Calculate scale to fit container
  useEffect(() => {
    const calculateScale = () => {
      if (!containerDivRef.current) return;

      const container = containerDivRef.current;
      const containerWidth = container.clientWidth - 16; // reduced padding for more width
      const containerHeight = container.clientHeight - 16;

      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;

      // Use height-based scaling (since height is almost perfect)
      // but ensure width also fits
      const newScale = Math.min(scaleX, scaleY * 0.98); // slight reduction to ensure it fits

      setScale(newScale);
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);

    // Recalculate after a short delay to ensure container is rendered
    const timer = setTimeout(calculateScale, 100);

    return () => {
      window.removeEventListener("resize", calculateScale);
      clearTimeout(timer);
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

    // Modification events
    canvas.on("object:modified", saveCanvasState);
    canvas.on("object:added", saveCanvasState);
    canvas.on("object:removed", saveCanvasState);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load template elements once canvas is ready
  useEffect(() => {
    if (!canvasReady || !fabricCanvasRef.current) return;
    loadTemplateElements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady]);

  const handleSelectionChange = useCallback((e) => {
    const obj = e.selected?.[0];
    if (!obj) return;

    setSelectedObject({
      type: obj.type,
      left: Math.round(obj.left / CANVAS_SCALE),
      top: Math.round(obj.top / CANVAS_SCALE),
      width: Math.round((obj.width * (obj.scaleX || 1)) / CANVAS_SCALE),
      height: Math.round((obj.height * (obj.scaleY || 1)) / CANVAS_SCALE),
      angle: Math.round(obj.angle || 0),
      // Text properties
      fontSize: obj.fontSize ? Math.round(obj.fontSize / CANVAS_SCALE) : null,
      fontFamily: obj.fontFamily || null,
      fontWeight: obj.fontWeight || "normal",
      fontStyle: obj.fontStyle || "normal",
      textAlign: obj.textAlign || "left",
      fill: obj.fill || "#000000",
      // Shape properties
      stroke: obj.stroke || null,
      strokeWidth: obj.strokeWidth ? obj.strokeWidth / CANVAS_SCALE : null,
      fabricObject: obj,
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
          fontStyle: element.fontStyle?.includes("italic")
            ? "italic"
            : "normal",
          width: (element.width || 200) * CANVAS_SCALE,
          editable: true,
        });
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
      }
    });

    canvas.renderAll();
  };

  const saveCanvasState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const elements = objects
      .map((obj) => {
        // Calculate position - for center-aligned text, save center X position
        let xPos = Math.round(obj.left / CANVAS_SCALE);
        const yPos = Math.round(obj.top / CANVAS_SCALE);

        // For text with center alignment, calculate and save the center X position
        if (
          (obj.type === "textbox" ||
            obj.type === "i-text" ||
            obj.type === "text") &&
          obj.textAlign === "center"
        ) {
          // Calculate center: left + (width / 2)
          const textWidth = obj.width * (obj.scaleX || 1);
          xPos = Math.round((obj.left + textWidth / 2) / CANVAS_SCALE);
        }

        const baseProps = {
          id: obj.id || `element-${Date.now()}-${Math.random()}`,
          x: xPos,
          y: yPos,
        };

        if (
          obj.type === "i-text" ||
          obj.type === "text" ||
          obj.type === "textbox"
        ) {
          return {
            ...baseProps,
            type: "text",
            text: obj.text,
            width: Math.round((obj.width * (obj.scaleX || 1)) / CANVAS_SCALE),
            height: Math.round((obj.height * (obj.scaleY || 1)) / CANVAS_SCALE),
            fontSize: Math.round((obj.fontSize || 16) / CANVAS_SCALE),
            font: obj.fontFamily || "Arial",
            fontStyle:
              `${obj.fontWeight !== "normal" ? "bold" : ""} ${
                obj.fontStyle !== "normal" ? "italic" : ""
              }`.trim() || "normal",
            color: obj.fill,
            align: obj.textAlign || "left", // Use actual textAlign from Fabric.js object
            // Include dynamic field information
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
        } else if (obj.type === "line") {
          return {
            ...baseProps,
            type: "line",
            width: Math.round((obj.x2 - obj.x1) / CANVAS_SCALE),
            height: Math.round(obj.strokeWidth / CANVAS_SCALE),
            color: obj.stroke,
          };
        } else if (obj.type === "image") {
          // Handle image elements (signatures, logos, etc.)
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
      useCanvasGeneration: true, // Flag to use canvas-based PDF generation
      fabricCanvas: fabricCanvasRef.current, // Pass canvas reference
    });

    // Debug: Log saved elements for centered text
    const centeredText = elements.filter(
      (el) => el.type === "text" && el.align === "center"
    );
    if (centeredText.length > 0) {
      console.log(
        "Saved centered text elements:",
        centeredText.map((el) => ({
          text: el.text,
          x: el.x,
          y: el.y,
          align: el.align,
          fontSize: el.fontSize,
          font: el.font,
        }))
      );
    }
  }, [template, onTemplateChange]);

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
  };

  const createSampleCertificate = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Clear canvas
    canvas.clear();
    canvas.backgroundColor = "#ffffff";

    // Calculate comfortable widths
    const usableWidth = (A4_WIDTH - 50) * CANVAS_SCALE;
    const titleWidth = usableWidth * 0.85;
    const textWidth = usableWidth * 0.7;

    // Simple elegant border
    const border = new Rect({
      left: 25 * CANVAS_SCALE,
      top: 25 * CANVAS_SCALE,
      width: canvasWidth - 50 * CANVAS_SCALE,
      height: canvasHeight - 50 * CANVAS_SCALE,
      fill: "transparent",
      stroke: "#2563eb",
      strokeWidth: 3 * CANVAS_SCALE,
    });
    canvas.add(border);

    // Title
    const title = new Textbox("Certificate of Achievement", {
      left: (canvasWidth - titleWidth) / 2,
      top: 45 * CANVAS_SCALE,
      fontSize: 40 * CANVAS_SCALE,
      fill: "#1e40af",
      fontFamily: "Georgia",
      fontWeight: "bold",
      width: titleWidth,
      textAlign: "center",
      editable: true,
    });
    canvas.add(title);

    // Subtitle
    const subtitle = new Textbox("This is to certify that", {
      left: (canvasWidth - textWidth) / 2,
      top: 95 * CANVAS_SCALE,
      fontSize: 15 * CANVAS_SCALE,
      fill: "#64748b",
      fontFamily: "Arial",
      width: textWidth,
      textAlign: "center",
      editable: true,
    });
    canvas.add(subtitle);

    // Name field (DYNAMIC) - Using placeholder text
    const nameField = new Textbox("Recipient Name", {
      left: (canvasWidth - textWidth) / 2,
      top: 120 * CANVAS_SCALE,
      fontSize: 30 * CANVAS_SCALE,
      fill: "#000000",
      fontFamily: "Georgia",
      fontWeight: "bold",
      width: textWidth,
      textAlign: "center",
      editable: true,
    });
    nameField.set("isDynamic", true);
    nameField.set("dataField", "name");
    canvas.add(nameField);

    // Course text
    const courseText = new Textbox("has successfully completed", {
      left: (canvasWidth - textWidth) / 2,
      top: 160 * CANVAS_SCALE,
      fontSize: 15 * CANVAS_SCALE,
      fill: "#64748b",
      fontFamily: "Arial",
      width: textWidth,
      textAlign: "center",
      editable: true,
    });
    canvas.add(courseText);

    // Course field (DYNAMIC) - Using placeholder text
    const courseField = new Textbox("Course or Program Name", {
      left: (canvasWidth - textWidth) / 2,
      top: 183 * CANVAS_SCALE,
      fontSize: 22 * CANVAS_SCALE,
      fill: "#1e40af",
      fontFamily: "Georgia",
      fontWeight: "bold",
      width: textWidth,
      textAlign: "center",
      editable: true,
    });
    courseField.set("isDynamic", true);
    courseField.set("dataField", "course");
    canvas.add(courseField);

    canvas.renderAll();
    saveCanvasState();

    console.log("Quick Template Created");
  };

  const createProfessionalCertificate = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Clear canvas
    canvas.clear();
    canvas.backgroundColor = "#ffffff";

    const usableWidth = (A4_WIDTH - 50) * CANVAS_SCALE;
    const centerX = canvasWidth / 2;

    // Elegant outer border
    const outerBorder = new Rect({
      left: 20 * CANVAS_SCALE,
      top: 20 * CANVAS_SCALE,
      width: canvasWidth - 40 * CANVAS_SCALE,
      height: canvasHeight - 40 * CANVAS_SCALE,
      fill: "transparent",
      stroke: "#1e40af",
      strokeWidth: 3 * CANVAS_SCALE,
    });
    canvas.add(outerBorder);

    // Inner border
    const innerBorder = new Rect({
      left: 25 * CANVAS_SCALE,
      top: 25 * CANVAS_SCALE,
      width: canvasWidth - 50 * CANVAS_SCALE,
      height: canvasHeight - 50 * CANVAS_SCALE,
      fill: "transparent",
      stroke: "#cbd5e1",
      strokeWidth: 1 * CANVAS_SCALE,
    });
    canvas.add(innerBorder);

    // Top decorative accent
    const topAccent = new Rect({
      left: centerX - 60 * CANVAS_SCALE,
      top: 40 * CANVAS_SCALE,
      width: 120 * CANVAS_SCALE,
      height: 3 * CANVAS_SCALE,
      fill: "#1e40af",
      stroke: "transparent",
    });
    canvas.add(topAccent);

    // Title
    const title = new Textbox("CERTIFICATE", {
      left: (canvasWidth - usableWidth * 0.7) / 2,
      top: 50 * CANVAS_SCALE,
      fontSize: 42 * CANVAS_SCALE,
      fill: "#1e40af",
      fontFamily: "Georgia",
      fontWeight: "bold",
      width: usableWidth * 0.7,
      textAlign: "center",
      editable: true,
    });
    canvas.add(title);

    // Subtitle
    const subtitle = new Textbox("of Achievement", {
      left: (canvasWidth - usableWidth * 0.6) / 2,
      top: 85 * CANVAS_SCALE,
      fontSize: 18 * CANVAS_SCALE,
      fill: "#64748b",
      fontFamily: "Georgia",
      fontStyle: "italic",
      width: usableWidth * 0.6,
      textAlign: "center",
      editable: true,
    });
    canvas.add(subtitle);

    // Presented to text
    const presentedTo = new Textbox("This is to certify that", {
      left: (canvasWidth - usableWidth * 0.6) / 2,
      top: 115 * CANVAS_SCALE,
      fontSize: 13 * CANVAS_SCALE,
      fill: "#64748b",
      fontFamily: "Arial",
      width: usableWidth * 0.6,
      textAlign: "center",
      editable: true,
    });
    canvas.add(presentedTo);

    // Name field (DYNAMIC) - Using placeholder text
    const nameField = new Textbox("Recipient Name", {
      left: (canvasWidth - usableWidth * 0.7) / 2,
      top: 135 * CANVAS_SCALE,
      fontSize: 30 * CANVAS_SCALE,
      fill: "#1e40af",
      fontFamily: "Georgia",
      fontWeight: "bold",
      width: usableWidth * 0.7,
      textAlign: "center",
      editable: true,
    });
    nameField.set("isDynamic", true);
    nameField.set("dataField", "name");
    canvas.add(nameField);

    // Name underline
    const nameUnderline = new Line(
      [
        centerX - 100 * CANVAS_SCALE,
        167 * CANVAS_SCALE,
        centerX + 100 * CANVAS_SCALE,
        167 * CANVAS_SCALE,
      ],
      {
        stroke: "#cbd5e1",
        strokeWidth: 1 * CANVAS_SCALE,
      }
    );
    canvas.add(nameUnderline);

    // Recognition text
    const recognitionText = new Textbox("has successfully completed", {
      left: (canvasWidth - usableWidth * 0.6) / 2,
      top: 175 * CANVAS_SCALE,
      fontSize: 13 * CANVAS_SCALE,
      fill: "#64748b",
      fontFamily: "Arial",
      width: usableWidth * 0.6,
      textAlign: "center",
      editable: true,
    });
    canvas.add(recognitionText);

    // Course field (DYNAMIC) - Using placeholder text
    const courseField = new Textbox("Course or Program Name", {
      left: (canvasWidth - usableWidth * 0.7) / 2,
      top: 193 * CANVAS_SCALE,
      fontSize: 20 * CANVAS_SCALE,
      fill: "#000000",
      fontFamily: "Georgia",
      fontWeight: "bold",
      width: usableWidth * 0.7,
      textAlign: "center",
      editable: true,
    });
    courseField.set("isDynamic", true);
    courseField.set("dataField", "course");
    canvas.add(courseField);

    canvas.renderAll();
    saveCanvasState();

    console.log("Professional Certificate Template Created");
  };

  const createDiplomaTemplate = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Clear canvas
    canvas.clear();
    canvas.backgroundColor = "#fffef7";

    const usableWidth = (A4_WIDTH - 50) * CANVAS_SCALE;
    const centerX = canvasWidth / 2;

    // Outer ornamental border
    const outerBorder = new Rect({
      left: 15 * CANVAS_SCALE,
      top: 15 * CANVAS_SCALE,
      width: canvasWidth - 30 * CANVAS_SCALE,
      height: canvasHeight - 30 * CANVAS_SCALE,
      fill: "transparent",
      stroke: "#92400e",
      strokeWidth: 4 * CANVAS_SCALE,
    });
    canvas.add(outerBorder);

    // Middle decorative border
    const middleBorder = new Rect({
      left: 20 * CANVAS_SCALE,
      top: 20 * CANVAS_SCALE,
      width: canvasWidth - 40 * CANVAS_SCALE,
      height: canvasHeight - 40 * CANVAS_SCALE,
      fill: "transparent",
      stroke: "#f59e0b",
      strokeWidth: 1 * CANVAS_SCALE,
    });
    canvas.add(middleBorder);

    // Inner border
    const innerBorder = new Rect({
      left: 25 * CANVAS_SCALE,
      top: 25 * CANVAS_SCALE,
      width: canvasWidth - 50 * CANVAS_SCALE,
      height: canvasHeight - 50 * CANVAS_SCALE,
      fill: "transparent",
      stroke: "#92400e",
      strokeWidth: 2 * CANVAS_SCALE,
    });
    canvas.add(innerBorder);

    // Top decorative element
    const topDecor = new Rect({
      left: centerX - 70 * CANVAS_SCALE,
      top: 42 * CANVAS_SCALE,
      width: 140 * CANVAS_SCALE,
      height: 3 * CANVAS_SCALE,
      fill: "#f59e0b",
      stroke: "transparent",
    });
    canvas.add(topDecor);

    // Title
    const title = new Textbox("DIPLOMA", {
      left: (canvasWidth - usableWidth * 0.5) / 2,
      top: 52 * CANVAS_SCALE,
      fontSize: 48 * CANVAS_SCALE,
      fill: "#78350f",
      fontFamily: "Georgia",
      fontWeight: "bold",
      width: usableWidth * 0.5,
      textAlign: "center",
      editable: true,
    });
    canvas.add(title);

    // Institution placeholder (can be edited)
    const institution = new Textbox("Your Institution Name", {
      left: (canvasWidth - usableWidth * 0.7) / 2,
      top: 92 * CANVAS_SCALE,
      fontSize: 14 * CANVAS_SCALE,
      fill: "#a8a29e",
      fontFamily: "Georgia",
      fontStyle: "italic",
      width: usableWidth * 0.7,
      textAlign: "center",
      editable: true,
    });
    canvas.add(institution);

    // Decorative line under institution
    const institutionLine = new Line(
      [
        centerX - 50 * CANVAS_SCALE,
        110 * CANVAS_SCALE,
        centerX + 50 * CANVAS_SCALE,
        110 * CANVAS_SCALE,
      ],
      {
        stroke: "#d6d3d1",
        strokeWidth: 1 * CANVAS_SCALE,
      }
    );
    canvas.add(institutionLine);

    // Presented to text
    const presentedTo = new Textbox("This diploma is conferred upon", {
      left: (canvasWidth - usableWidth * 0.6) / 2,
      top: 120 * CANVAS_SCALE,
      fontSize: 12 * CANVAS_SCALE,
      fill: "#78716c",
      fontFamily: "Arial",
      width: usableWidth * 0.6,
      textAlign: "center",
      editable: true,
    });
    canvas.add(presentedTo);

    // Name field (DYNAMIC) - Using placeholder text
    const nameField = new Textbox("Recipient Full Name", {
      left: (canvasWidth - usableWidth * 0.7) / 2,
      top: 140 * CANVAS_SCALE,
      fontSize: 32 * CANVAS_SCALE,
      fill: "#78350f",
      fontFamily: "Georgia",
      fontWeight: "bold",
      fontStyle: "italic",
      width: usableWidth * 0.7,
      textAlign: "center",
      editable: true,
    });
    nameField.set("isDynamic", true);
    nameField.set("dataField", "name");
    canvas.add(nameField);

    // Underline for name
    const nameLine = new Line(
      [
        centerX - 110 * CANVAS_SCALE,
        172 * CANVAS_SCALE,
        centerX + 110 * CANVAS_SCALE,
        172 * CANVAS_SCALE,
      ],
      {
        stroke: "#92400e",
        strokeWidth: 1.5 * CANVAS_SCALE,
      }
    );
    canvas.add(nameLine);

    // Recognition text
    const recognitionText = new Textbox(
      "in recognition of successful completion of",
      {
        left: (canvasWidth - usableWidth * 0.6) / 2,
        top: 180 * CANVAS_SCALE,
        fontSize: 12 * CANVAS_SCALE,
        fill: "#78716c",
        fontFamily: "Arial",
        width: usableWidth * 0.6,
        textAlign: "center",
        editable: true,
      }
    );
    canvas.add(recognitionText);

    // Course/Program field (DYNAMIC) - Using placeholder text
    const courseField = new Textbox("Degree or Program Name", {
      left: (canvasWidth - usableWidth * 0.7) / 2,
      top: 197 * CANVAS_SCALE,
      fontSize: 18 * CANVAS_SCALE,
      fill: "#1c1917",
      fontFamily: "Georgia",
      fontWeight: "bold",
      width: usableWidth * 0.7,
      textAlign: "center",
      editable: true,
    });
    courseField.set("isDynamic", true);
    courseField.set("dataField", "course");
    canvas.add(courseField);

    canvas.renderAll();
    saveCanvasState();

    console.log("Diploma Template Created");
  };

  const addRectangle = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const rect = new Rect({
      left: 100 * CANVAS_SCALE,
      top: 100 * CANVAS_SCALE,
      width: 150 * CANVAS_SCALE,
      height: 100 * CANVAS_SCALE,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 2 * CANVAS_SCALE,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addLine = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const line = new Line(
      [
        50 * CANVAS_SCALE,
        50 * CANVAS_SCALE,
        250 * CANVAS_SCALE,
        50 * CANVAS_SCALE,
      ],
      {
        stroke: "#000000",
        strokeWidth: 2 * CANVAS_SCALE,
      }
    );
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
      setSelectedObject(null);
    }
  };

  const duplicateSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned) => {
        cloned.set({
          left: cloned.left + 10 * CANVAS_SCALE,
          top: cloned.top + 10 * CANVAS_SCALE,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
      });
    }
  };

  const bringToFront = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (activeObject && canvas) {
      canvas.bringObjectToFront(activeObject);
      canvas.renderAll();
      saveCanvasState();
    }
  };

  const sendToBack = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (activeObject && canvas) {
      canvas.sendObjectToBack(activeObject);
      canvas.renderAll();
      saveCanvasState();
    }
  };

  // Add image/signature upload
  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      FabricImage.fromURL(event.target.result).then((img) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Scale image to reasonable size
        const maxWidth = 100 * CANVAS_SCALE;
        const maxHeight = 100 * CANVAS_SCALE;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

        img.set({
          left: 100 * CANVAS_SCALE,
          top: 100 * CANVAS_SCALE,
          scaleX: scale,
          scaleY: scale,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveCanvasState();
      });
    };
    reader.readAsDataURL(file);
  };

  // CSV and batch generation
  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      // Simple CSV parser
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim());
      const data = lines.slice(1).map((line) => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = values[i]?.trim() || "";
        });
        return obj;
      });
      setCsvData(data);
      setShowCsvModal(true);
    };
    reader.readAsText(file);
  };

  const generateBatchPDFs = async () => {
    // This will be handled by the parent component
    // Return the template, CSV data, and batch information
    if (onTemplateChange) {
      onTemplateChange({
        ...template,
        csvData: csvData,
        batchInfo: batchInfo, // Include course/batch name
        batchGenerate: true,
      });
    }
    setShowCsvModal(false);
    setShowRecipientsList(true);
  };

  // Preview certificate with specific recipient data
  const previewRecipient = (recipient) => {
    setSelectedRecipient(recipient);
    setPreviewMode(true);
    applyRecipientData(recipient);
  };

  // Apply recipient data to canvas (replace dynamic fields)
  const applyRecipientData = (recipient) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Store original values before replacing
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj.isDynamic && obj.dataField && recipient[obj.dataField]) {
        // Store original if not already stored
        if (!obj.originalText) {
          obj.originalText = obj.text;
        }
        // Replace with CSV data
        obj.set("text", recipient[obj.dataField]);
      }
    });

    canvas.renderAll();
  };

  // Restore template to design mode
  const exitPreviewMode = () => {
    setPreviewMode(false);
    setSelectedRecipient(null);

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Restore original values
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj.originalText) {
        obj.set("text", obj.originalText);
      }
    });

    canvas.renderAll();
  };

  // Generate single PDF for selected recipient
  const generateSinglePDF = () => {
    if (onTemplateChange && selectedRecipient) {
      onTemplateChange({
        ...template,
        currentRecipient: selectedRecipient,
        generateSingle: true,
      });
    }
  };

  // Property update functions
  const updateTextProperty = (property, value) => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (
      !activeObject ||
      (activeObject.type !== "textbox" &&
        activeObject.type !== "i-text" &&
        activeObject.type !== "text")
    )
      return;

    if (property === "fontSize") {
      activeObject.set("fontSize", value * CANVAS_SCALE);
    } else if (property === "fontFamily") {
      activeObject.set("fontFamily", value);
    } else if (property === "fontWeight") {
      activeObject.set("fontWeight", value);
    } else if (property === "fontStyle") {
      activeObject.set("fontStyle", value);
    } else if (property === "textAlign") {
      activeObject.set("textAlign", value);
    } else if (property === "fill") {
      activeObject.set("fill", value);
    }

    canvas.renderAll();
    handleSelectionChange({ selected: [activeObject] });
    saveCanvasState();
  };

  const updateShapeProperty = (property, value) => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (!activeObject) return;

    if (property === "fill") {
      activeObject.set("fill", value);
    } else if (property === "stroke") {
      activeObject.set("stroke", value);
    } else if (property === "strokeWidth") {
      activeObject.set("strokeWidth", value * CANVAS_SCALE);
    }

    canvas.renderAll();
    handleSelectionChange({ selected: [activeObject] });
    saveCanvasState();
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Left Toolbar - Compact */}
      <div className="flex flex-col gap-2 bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl">
        <div className="text-[10px] text-gray-400 font-semibold mb-1 text-center uppercase tracking-wide">
          Tools
        </div>

        <button
          onClick={addText}
          className="group relative p-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg text-blue-400 hover:text-blue-300 transition-all duration-200"
          title="Add Text"
        >
          <Type size={18} className="mx-auto" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Add Text
          </span>
        </button>

        <button
          onClick={addRectangle}
          className="group relative p-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 rounded-lg text-green-400 hover:text-green-300 transition-all duration-200"
          title="Add Shape"
        >
          <Square size={18} className="mx-auto" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Add Shape
          </span>
        </button>

        <button
          onClick={addLine}
          className="group relative p-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/40 rounded-lg text-yellow-400 hover:text-yellow-300 transition-all duration-200"
          title="Add Line"
        >
          <Minus size={18} className="mx-auto" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Add Line
          </span>
        </button>

        <div className="border-t border-white/10 my-1"></div>

        <button
          onClick={addImage}
          className="group relative p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg text-indigo-400 hover:text-indigo-300 transition-all duration-200"
          title="Add Image/Signature"
        >
          <Upload size={18} className="mx-auto" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Add Image
          </span>
        </button>

        <button
          onClick={() => csvInputRef.current?.click()}
          className="group relative p-2.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 rounded-lg text-orange-400 hover:text-orange-300 transition-all duration-200"
          title="Upload CSV Data"
        >
          <FileText size={18} className="mx-auto" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Upload CSV
          </span>
        </button>

        {/* Show Recipients List if CSV loaded */}
        {csvData.length > 0 && (
          <button
            onClick={() => setShowRecipientsList(!showRecipientsList)}
            className={`group relative p-2.5 rounded-lg transition-all duration-200 ${
              showRecipientsList
                ? "bg-green-500/20 border border-green-500/40 text-green-400"
                : "bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 text-green-400 hover:text-green-300"
            }`}
            title="Toggle Recipients List"
          >
            <FileText size={18} className="mx-auto" />
            {csvData.length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                {csvData.length}
              </div>
            )}
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
              Recipients ({csvData.length})
            </span>
          </button>
        )}

        <div className="border-t border-white/10 my-1"></div>

        <button
          onClick={duplicateSelected}
          disabled={!selectedObject}
          className="group relative p-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-lg text-purple-400 hover:text-purple-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
          title="Duplicate"
        >
          <Copy size={18} className="mx-auto" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Duplicate
          </span>
        </button>

        <button
          onClick={deleteSelected}
          disabled={!selectedObject}
          className="group relative p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg text-red-400 hover:text-red-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
          title="Delete"
        >
          <Trash2 size={18} className="mx-auto" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Delete
          </span>
        </button>

        <div className="border-t border-white/10 my-1"></div>

        <button
          onClick={bringToFront}
          disabled={!selectedObject}
          className="group relative p-2.5 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 hover:border-gray-500/40 rounded-lg text-gray-400 hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
          title="Bring Forward"
        >
          <Layers size={18} className="mx-auto" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            To Front
          </span>
        </button>

        <button
          onClick={sendToBack}
          disabled={!selectedObject}
          className="group relative p-2.5 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 hover:border-gray-500/40 rounded-lg text-gray-400 hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
          title="Send Backward"
        >
          <Layers size={18} className="mx-auto rotate-180" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            To Back
          </span>
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        onChange={handleCsvUpload}
        className="hidden"
      />

      {/* CSV Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              CSV Data Loaded
            </h3>
            <p className="text-gray-300 mb-4">
              Found{" "}
              <span className="text-blue-400 font-bold">{csvData.length}</span>{" "}
              records. Configure batch details below:
            </p>

            {/* Batch Information Inputs */}
            <div className="bg-gray-900/50 rounded-lg p-4 mb-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Course/Program Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={batchInfo.courseName}
                  onChange={(e) =>
                    setBatchInfo({ ...batchInfo, courseName: e.target.value })
                  }
                  placeholder="e.g., Web Development Bootcamp"
                  className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Batch/Cohort Name (optional)
                </label>
                <input
                  type="text"
                  value={batchInfo.batchName}
                  onChange={(e) =>
                    setBatchInfo({ ...batchInfo, batchName: e.target.value })
                  }
                  placeholder="e.g., Batch 2025-Q1"
                  className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <p className="text-xs text-gray-500">
                💡 This course/batch name will be used for all {csvData.length}{" "}
                certificates
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 mb-4 max-h-60 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    {csvData[0] &&
                      Object.keys(csvData[0]).map((key) => (
                        <th
                          key={key}
                          className="px-2 py-1 border-b border-white/10"
                        >
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="text-white">
                  {csvData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-2 py-1">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvData.length > 5 && (
                <p className="text-gray-500 text-xs mt-2">
                  ... and {csvData.length - 5} more
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={generateBatchPDFs}
                disabled={!batchInfo.courseName.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium"
              >
                <Download size={20} />
                Generate {csvData.length} PDFs
              </button>
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipients List Panel */}
      {showRecipientsList && csvData.length > 0 && (
        <div className="fixed right-4 top-20 bottom-4 w-80 bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-40 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Recipients List</h3>
              <p className="text-xs text-gray-400">{csvData.length} people</p>
            </div>
            <button
              onClick={() => setShowRecipientsList(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Preview Mode Banner */}
          {previewMode && selectedRecipient && (
            <div className="px-4 py-3 bg-blue-500/20 border-b border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-blue-300 font-semibold">
                  👁️ Preview Mode
                </div>
                <button
                  onClick={exitPreviewMode}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Exit Preview
                </button>
              </div>
              <div className="text-sm text-white font-semibold">
                {selectedRecipient.name || Object.values(selectedRecipient)[0]}
              </div>
              <button
                onClick={generateSinglePDF}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-xs font-medium"
              >
                <Eye size={14} />
                Preview & Download
              </button>
            </div>
          )}

          {/* Recipients List */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {csvData.map((recipient, index) => {
                const isSelected = selectedRecipient === recipient;
                const displayName =
                  recipient.name ||
                  recipient.fullname ||
                  recipient.email ||
                  Object.values(recipient)[0] ||
                  `Person ${index + 1}`;
                const displayInfo =
                  recipient.email ||
                  recipient.course ||
                  Object.values(recipient)[1] ||
                  "";

                return (
                  <button
                    key={index}
                    onClick={() => previewRecipient(recipient)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isSelected
                        ? "bg-blue-500/20 border border-blue-500/40"
                        : "bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium truncate ${
                            isSelected ? "text-blue-300" : "text-white"
                          }`}
                        >
                          {displayName}
                        </div>
                        {displayInfo && (
                          <div className="text-xs text-gray-400 truncate mt-0.5">
                            {displayInfo}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        #{index + 1}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 border-t border-white/10 space-y-2">
            <button
              onClick={() => {
                if (onTemplateChange) {
                  onTemplateChange({
                    ...template,
                    csvData: csvData,
                    batchGenerate: true,
                  });
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all font-medium text-sm"
            >
              <Eye size={16} />
              Preview All {csvData.length} PDFs
            </button>
            <button
              onClick={() => {
                setShowRecipientsList(false);
                setCsvData([]);
                exitPreviewMode();
              }}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all text-sm"
            >
              Clear & Close
            </button>
          </div>
        </div>
      )}

      {/* Center Canvas Area - Maximum Space */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Canvas Container - Full Height */}
        <div
          ref={containerDivRef}
          className="flex-1 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-xl border border-white/10 p-2 flex items-center justify-center overflow-hidden shadow-2xl"
        >
          <div
            className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            <canvas ref={canvasContainerRef} />
          </div>
        </div>

        {/* Bottom Info Bar - Compact */}
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300">Ready</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <span className="text-xs text-gray-400 font-mono">
              {A4_WIDTH} × {A4_HEIGHT} mm
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={createSampleCertificate}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-purple-300 text-xs rounded-lg transition-all duration-200 flex items-center gap-2"
                title="Create a simple certificate template"
              >
                <Sparkles size={14} />
                Quick Template
              </button>
              <button
                onClick={createProfessionalCertificate}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 text-blue-300 text-xs rounded-lg transition-all duration-200 flex items-center gap-2"
                title="Create a professional certificate with decorative borders"
              >
                <Sparkles size={14} />
                Certificate
              </button>
              <button
                onClick={createDiplomaTemplate}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 text-xs rounded-lg transition-all duration-200 flex items-center gap-2"
                title="Create a formal diploma template"
              >
                <Sparkles size={14} />
                Diploma
              </button>
            </div>
            <div className="text-xs text-gray-400">
              💡 Double-click text to edit • Drag to move • Corners to resize
            </div>
          </div>
        </div>
      </div>

      {/* Right Design Panel - Canva-style */}
      {selectedObject && (
        <div className="w-80 bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl space-y-4 overflow-y-auto max-h-full">
          <div className="flex items-center justify-between sticky top-0 bg-gray-800/80 backdrop-blur -mx-4 -mt-4 px-4 py-3 rounded-t-xl border-b border-white/10">
            <h4 className="text-sm font-bold text-white">Design</h4>
            <div className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg">
              <span className="text-[10px] text-blue-300 font-mono font-semibold uppercase">
                {selectedObject.type}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Text Properties */}
            {(selectedObject.type === "textbox" ||
              selectedObject.type === "i-text" ||
              selectedObject.type === "text") && (
              <>
                {/* Font Family */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
                  <label className="text-xs text-gray-400 font-semibold mb-2 block uppercase tracking-wider">
                    Font Family
                  </label>
                  <select
                    value={selectedObject.fontFamily || "Arial"}
                    onChange={(e) =>
                      updateTextProperty("fontFamily", e.target.value)
                    }
                    className="w-full bg-gray-900/80 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                    <option value="Impact">Impact</option>
                    <option value="Trebuchet MS">Trebuchet MS</option>
                    <option value="Palatino">Palatino</option>
                  </select>
                </div>

                {/* Font Size */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
                  <label className="text-xs text-gray-400 font-semibold mb-2 block uppercase tracking-wider">
                    Font Size
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="8"
                      max="120"
                      value={selectedObject.fontSize || 16}
                      onChange={(e) =>
                        updateTextProperty("fontSize", parseInt(e.target.value))
                      }
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="8"
                      max="120"
                      value={selectedObject.fontSize || 16}
                      onChange={(e) =>
                        updateTextProperty("fontSize", parseInt(e.target.value))
                      }
                      className="w-16 bg-gray-900/80 border border-white/10 rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Font Style */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
                  <label className="text-xs text-gray-400 font-semibold mb-2 block uppercase tracking-wider">
                    Font Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        updateTextProperty(
                          "fontWeight",
                          selectedObject.fontWeight === "bold"
                            ? "normal"
                            : "bold"
                        )
                      }
                      className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                        selectedObject.fontWeight === "bold"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-900/50 text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      Bold
                    </button>
                    <button
                      onClick={() =>
                        updateTextProperty(
                          "fontStyle",
                          selectedObject.fontStyle === "italic"
                            ? "normal"
                            : "italic"
                        )
                      }
                      className={`px-3 py-2 rounded-lg italic text-sm transition-all ${
                        selectedObject.fontStyle === "italic"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-900/50 text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      Italic
                    </button>
                  </div>
                </div>

                {/* Text Align */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
                  <label className="text-xs text-gray-400 font-semibold mb-2 block uppercase tracking-wider">
                    Text Align
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateTextProperty("textAlign", "left")}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedObject.textAlign === "left"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-900/50 text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      Left
                    </button>
                    <button
                      onClick={() => updateTextProperty("textAlign", "center")}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedObject.textAlign === "center"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-900/50 text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      Center
                    </button>
                    <button
                      onClick={() => updateTextProperty("textAlign", "right")}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedObject.textAlign === "right"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-900/50 text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      Right
                    </button>
                  </div>
                </div>

                {/* Text Color */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
                  <label className="text-xs text-gray-400 font-semibold mb-2 block uppercase tracking-wider">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedObject.fill || "#000000"}
                      onChange={(e) =>
                        updateTextProperty("fill", e.target.value)
                      }
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/10"
                    />
                    <input
                      type="text"
                      value={selectedObject.fill || "#000000"}
                      onChange={(e) =>
                        updateTextProperty("fill", e.target.value)
                      }
                      className="flex-1 bg-gray-900/80 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500/50"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Dynamic Field Mapping */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur border border-blue-500/20 rounded-xl p-3">
                  <label className="text-xs text-blue-300 font-semibold mb-2 flex items-center gap-2 uppercase tracking-wider">
                    <FileText size={14} />
                    Dynamic Field (CSV)
                  </label>
                  <p className="text-[10px] text-gray-400 mb-2">
                    Link this text to a CSV column for batch generation
                  </p>

                  {/* Show available CSV columns if CSV is loaded */}
                  {csvData.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-blue-300 mb-1.5 font-medium">
                        Available columns (click to use):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.keys(csvData[0]).map((column) => (
                          <button
                            key={column}
                            onClick={() => {
                              const obj = selectedObject.fabricObject;
                              if (obj) {
                                // Set the text to the template variable
                                obj.set("text", `{{${column}}}`);
                                obj.set("dataField", column);
                                obj.set("isDynamic", true);
                                fabricCanvasRef.current?.renderAll();
                                handleSelectionChange({ selected: [obj] });
                                saveCanvasState();
                              }
                            }}
                            className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded text-[10px] text-blue-200 transition-all font-mono"
                            title={`Insert {{${column}}}`}
                          >
                            {column}
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-500 mt-1.5">
                        💡 Columns from your CSV file
                      </p>
                    </div>
                  )}

                  {/* Manual input for custom fields */}
                  <input
                    type="text"
                    placeholder={
                      csvData.length > 0
                        ? "or type column name manually"
                        : "e.g., name, email, course"
                    }
                    value={selectedObject.fabricObject?.dataField || ""}
                    onChange={(e) => {
                      const obj = selectedObject.fabricObject;
                      if (obj) {
                        obj.set("dataField", e.target.value);
                        obj.set("isDynamic", !!e.target.value);
                        // Auto-update text to show template format
                        if (e.target.value) {
                          obj.set("text", `{{${e.target.value}}}`);
                        }
                        fabricCanvasRef.current?.renderAll();
                        handleSelectionChange({ selected: [obj] });
                        saveCanvasState();
                      }
                    }}
                    className="w-full bg-gray-900/80 border border-blue-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-500"
                  />
                  {selectedObject.fabricObject?.dataField && (
                    <div className="mt-2 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                      ✓ Linked to:{" "}
                      <span className="font-mono font-bold">
                        {selectedObject.fabricObject.dataField}
                      </span>
                    </div>
                  )}

                  {/* Show batch info fields */}
                  {!csvData.length && (
                    <div className="mt-2 px-2 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-300">
                      <p className="font-medium mb-1">Built-in batch fields:</p>
                      <div className="flex flex-wrap gap-1">
                        <code className="px-1.5 py-0.5 bg-purple-500/20 rounded">
                          course
                        </code>
                        <code className="px-1.5 py-0.5 bg-purple-500/20 rounded">
                          batch
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Shape Properties */}
            {(selectedObject.type === "rect" ||
              selectedObject.type === "line") && (
              <>
                {/* Fill Color */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
                  <label className="text-xs text-gray-400 font-semibold mb-2 block uppercase tracking-wider">
                    Fill Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedObject.fill || "#transparent"}
                      onChange={(e) =>
                        updateShapeProperty("fill", e.target.value)
                      }
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/10"
                    />
                    <input
                      type="text"
                      value={selectedObject.fill || "transparent"}
                      onChange={(e) =>
                        updateShapeProperty("fill", e.target.value)
                      }
                      className="flex-1 bg-gray-900/80 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500/50"
                      placeholder="transparent"
                    />
                  </div>
                </div>

                {/* Stroke Color */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
                  <label className="text-xs text-gray-400 font-semibold mb-2 block uppercase tracking-wider">
                    Border Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedObject.stroke || "#000000"}
                      onChange={(e) =>
                        updateShapeProperty("stroke", e.target.value)
                      }
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/10"
                    />
                    <input
                      type="text"
                      value={selectedObject.stroke || "#000000"}
                      onChange={(e) =>
                        updateShapeProperty("stroke", e.target.value)
                      }
                      className="flex-1 bg-gray-900/80 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500/50"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
                  <label className="text-xs text-gray-400 font-semibold mb-2 block uppercase tracking-wider">
                    Border Width
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.5"
                      value={selectedObject.strokeWidth || 1}
                      onChange={(e) =>
                        updateShapeProperty(
                          "strokeWidth",
                          parseFloat(e.target.value)
                        )
                      }
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={selectedObject.strokeWidth || 1}
                      onChange={(e) =>
                        updateShapeProperty(
                          "strokeWidth",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-16 bg-gray-900/80 border border-white/10 rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Position & Size */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 rounded-xl p-3">
              <div className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">
                Position & Size
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-900/50 backdrop-blur rounded-lg p-2 border border-white/5">
                  <div className="text-[9px] text-gray-500 mb-1 uppercase">
                    X
                  </div>
                  <div className="text-white font-mono text-sm font-semibold">
                    {selectedObject.left}
                    <span className="text-[10px] text-gray-500 ml-1">mm</span>
                  </div>
                </div>
                <div className="bg-gray-900/50 backdrop-blur rounded-lg p-2 border border-white/5">
                  <div className="text-[9px] text-gray-500 mb-1 uppercase">
                    Y
                  </div>
                  <div className="text-white font-mono text-sm font-semibold">
                    {selectedObject.top}
                    <span className="text-[10px] text-gray-500 ml-1">mm</span>
                  </div>
                </div>
                <div className="bg-gray-900/50 backdrop-blur rounded-lg p-2 border border-white/5">
                  <div className="text-[9px] text-gray-500 mb-1 uppercase">
                    Width
                  </div>
                  <div className="text-white font-mono text-sm font-semibold">
                    {selectedObject.width}
                    <span className="text-[10px] text-gray-500 ml-1">mm</span>
                  </div>
                </div>
                <div className="bg-gray-900/50 backdrop-blur rounded-lg p-2 border border-white/5">
                  <div className="text-[9px] text-gray-500 mb-1 uppercase">
                    Height
                  </div>
                  <div className="text-white font-mono text-sm font-semibold">
                    {selectedObject.height}
                    <span className="text-[10px] text-gray-500 ml-1">mm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rotation */}
            {selectedObject.angle !== 0 && (
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur border border-purple-500/20 rounded-xl p-3">
                <div className="text-xs text-purple-300 font-semibold mb-2 uppercase tracking-wider">
                  Rotation
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold text-white">
                    {selectedObject.angle}°
                  </div>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                      style={{
                        width: `${
                          (Math.abs(selectedObject.angle) / 360) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricDesignerV2;
