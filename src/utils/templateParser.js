/**
 * Template Parser Utility
 * Handles parsing of PDF, Word, and Image templates
 */

import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";

/**
 * Parse PDF file and extract text elements with positions
 * @param {File} file - PDF file
 * @returns {Promise<Object>} Template structure with elements
 */
export const parsePDFTemplate = async (file) => {
  try {
    // For PDF, we'll convert it to an image for use as background
    // Full text extraction with precise positions requires PDF.js which is complex
    // This approach allows users to see the PDF and add fields on top

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const { width, height } = firstPage.getSize();

    // Convert PDF to data URL for display
    // In a production app, you'd render PDF to canvas and convert to image
    // For now, we'll create a placeholder and let users add fields
    const pdfDataUrl = URL.createObjectURL(file);

    // Create some default text elements based on common certificate patterns
    const elements = [
      {
        id: `element-${Date.now()}-1`,
        type: "text",
        text: "Certificate of Completion",
        x: (width * 0.352778) / 2 - 75, // Center horizontally
        y: 50,
        width: 150,
        height: 20,
        fontSize: 18,
        font: "helvetica",
        color: "#000000",
        align: "center",
        isDynamic: false,
        dataField: null,
      },
      {
        id: `element-${Date.now()}-2`,
        type: "text",
        text: "This is to certify that",
        x: (width * 0.352778) / 2 - 60,
        y: 100,
        width: 120,
        height: 15,
        fontSize: 12,
        font: "helvetica",
        color: "#000000",
        align: "center",
        isDynamic: false,
        dataField: null,
      },
      {
        id: `element-${Date.now()}-3`,
        type: "text",
        text: "{{name}}",
        x: (width * 0.352778) / 2 - 75,
        y: 130,
        width: 150,
        height: 20,
        fontSize: 16,
        font: "helvetica",
        color: "#000000",
        align: "center",
        isDynamic: true,
        dataField: "name",
      },
    ];

    return {
      elements,
      backgroundImage: pdfDataUrl,
      orientation: width > height ? "landscape" : "portrait",
      format: "A4",
      backgroundColor: "#FFFFFF",
      width: width * 0.352778, // Convert points to mm (1 point = 0.352778 mm)
      height: height * 0.352778,
      pdfFile: file,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Parse Word document and extract text elements
 * @param {File} file - Word document file (.doc or .docx)
 * @returns {Promise<Object>} Template structure with elements
 */
export const parseWordTemplate = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    // Parse text content and create elements
    const lines = result.value.split("\n").filter((line) => line.trim());
    const elements = [];

    lines.forEach((line, index) => {
      if (line.trim()) {
        elements.push({
          id: `element-${Date.now()}-${index}`,
          type: "text",
          text: line.trim(),
          x: 20,
          y: 30 + index * 25, // Stack vertically
          width: 170,
          height: 20,
          fontSize: 12,
          font: "helvetica",
          color: "#000000",
          align: "left",
          isDynamic: false,
          dataField: null,
        });
      }
    });

    return {
      elements,
      backgroundImage: null,
      orientation: "portrait",
      format: "A4",
      backgroundColor: "#FFFFFF",
      width: 210,
      height: 297,
    };
  } catch (error) {
    console.error("Word parsing error:", error);
    throw new Error(`Failed to parse Word document: ${error.message}`);
  }
};

/**
 * Parse image file and create template with image as background
 * @param {File} file - Image file
 * @returns {Promise<Object>} Template structure
 */
export const parseImageTemplate = async (file) => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Calculate dimensions (maintain aspect ratio, fit to A4)
          const a4Width = 210; // mm
          const a4Height = 297; // mm
          const imgAspect = img.width / img.height;
          const a4Aspect = a4Width / a4Height;

          let width, height;
          if (imgAspect > a4Aspect) {
            width = a4Width;
            height = a4Width / imgAspect;
          } else {
            height = a4Height;
            width = a4Height * imgAspect;
          }

          resolve({
            elements: [],
            backgroundImage: event.target.result,
            orientation: width > height ? "landscape" : "portrait",
            format: "A4",
            backgroundColor: "#FFFFFF",
            width,
            height,
          });
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error("Image parsing error:", error);
    throw new Error(`Failed to parse image: ${error.message}`);
  }
};

/**
 * Detect file type and parse accordingly
 * @param {File} file - Template file
 * @returns {Promise<Object>} Parsed template structure
 */
export const parseTemplateFile = async (file) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return await parsePDFTemplate(file);
  } else if (
    fileType.includes("wordprocessingml") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  ) {
    return await parseWordTemplate(file);
  } else if (
    fileType.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)
  ) {
    return await parseImageTemplate(file);
  } else {
    throw new Error(`Unsupported file type: ${fileType || fileName}`);
  }
};



