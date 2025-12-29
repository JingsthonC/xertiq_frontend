import jsPDF from "jspdf";

/**
 * Generate pixel-perfect PDF from Konva stage
 * Ensures what you see is exactly what you get
 */
class KonvaPdfGenerator {
  /**
   * Generate PDF from Konva stage with proper A4 dimensions
   * @param {Object} stage - Konva stage instance
   * @param {Object} options - Generation options
   * @param {string} options.orientation - 'landscape' or 'portrait'
   * @param {string} options.format - Paper format (default: 'a4')
   * @param {string} options.backgroundColor - Background color (default: '#ffffff')
   * @param {number} options.pixelRatio - Pixel ratio for quality (default: 2)
   * @param {Object} options.data - Data to replace dynamic fields
   * @param {Array} options.elements - Konva elements array (for dynamic field replacement)
   * @returns {jsPDF} Generated PDF document
   */
  generateFromStage(stage, options = {}) {
    const {
      orientation = "landscape",
      format = "a4",
      backgroundColor = "#ffffff",
      pixelRatio = 2,
      data = null,
      elements = [],
    } = options;

    if (!stage) {
      throw new Error("Stage is required for PDF generation");
    }

    // Hide transformer before capturing (if it exists)
    // Search for transformer in all layers
    let transformer = null;
    let transformerWasVisible = true;
    stage.getLayers().forEach((layer) => {
      const found = layer.find((node) => node.getClassName() === "Transformer");
      if (found && found.length > 0) {
        transformer = found[0];
      }
    });
    
    if (transformer) {
      transformerWasVisible = transformer.visible();
      transformer.visible(false);
      stage.getLayers()[0]?.batchDraw();
    }

    // Store original text values if data is provided
    const originalTexts = {};
    if (data && elements.length > 0) {
      elements.forEach((el) => {
        if (el.type === "text" && el.isDynamic && el.dataField) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            originalTexts[el.id] = textNode.text();
            const value = data[el.dataField] || `{{${el.dataField}}}`;
            textNode.text(value);
          }
        }
      });
      stage.getLayers()[0]?.batchDraw();
    }

    // Convert stage to high-quality image
    const dataURL = stage.toDataURL({
      pixelRatio,
      mimeType: "image/png",
      quality: 1.0,
      backgroundColor,
    });

    // Restore original text values
    if (Object.keys(originalTexts).length > 0) {
      elements.forEach((el) => {
        if (originalTexts[el.id]) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            textNode.text(originalTexts[el.id]);
          }
        }
      });
      stage.getLayers()[0]?.batchDraw();
    }

    // Restore transformer visibility (after text restoration)
    if (transformer && transformerWasVisible) {
      transformer.visible(true);
      stage.getLayers()[0]?.batchDraw();
    }

    // Create PDF with A4 dimensions in mm
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    });

    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    // Add the canvas image to fill the entire PDF page
    pdf.addImage(
      dataURL,
      "PNG",
      0,
      0,
      pageWidth,
      pageHeight,
      undefined,
      "FAST"
    );

    return pdf;
  }

  /**
   * Generate batch PDFs from Konva stage with CSV data
   * @param {Object} stage - Konva stage instance
   * @param {Array} dataArray - Array of data objects
   * @param {Object} options - Generation options
   * @returns {Array} Array of {pdf, filename, data} objects
   */
  async generateBatch(stage, dataArray, options = {}) {
    const {
      orientation = "landscape",
      format = "a4",
      backgroundColor = "#ffffff",
      pixelRatio = 2,
      elements = [],
      filenamePattern = "certificate_{{name}}_{{index}}.pdf",
    } = options;

    if (!stage || !dataArray || dataArray.length === 0) {
      throw new Error("Stage and data array are required");
    }

    const pdfs = [];
    const layer = stage.getLayers()[0];

    for (let i = 0; i < dataArray.length; i++) {
      const data = dataArray[i];

      // Store original text values
      const originalTexts = {};

      // Replace dynamic fields with actual data
      elements.forEach((el) => {
        if (el.type === "text" && el.isDynamic && el.dataField) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            originalTexts[el.id] = textNode.text();
            const value = data[el.dataField] || `{{${el.dataField}}}`;
            textNode.text(value);
          }
        }
      });

      layer?.batchDraw();

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate PDF
      const pdf = this.generateFromStage(stage, {
        orientation,
        format,
        backgroundColor,
        pixelRatio,
        data,
        elements,
      });

      // Restore original text values
      elements.forEach((el) => {
        if (originalTexts[el.id]) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            textNode.text(originalTexts[el.id]);
          }
        }
      });

      layer?.batchDraw();

      // Generate filename with consistent sanitization
      // Helper to sanitize filename values (remove spaces, special chars)
      // This ensures PDF and CSV filenames match exactly
      const sanitize = (value) => {
        if (!value) return "";
        return value
          .toString()
          .replace(/\s+/g, "_") // Replace spaces with underscores
          .replace(/[^a-zA-Z0-9_-]/g, "") // Remove special characters
          .substring(0, 50); // Limit length
      };

      let filename = filenamePattern;
      const nameValue = data.name || data.Name || `record_${i + 1}`;
      filename = filename.replace(/\{\{name\}\}/g, sanitize(nameValue));
      filename = filename.replace(/\{\{index\}\}/g, i + 1);
      Object.keys(data).forEach((key) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        filename = filename.replace(regex, sanitize(data[key]));
      });

      pdfs.push({
        pdf,
        filename,
        data,
      });
    }

    return pdfs;
  }

  /**
   * Generate single PDF with data replacement
   * @param {Object} stage - Konva stage instance
   * @param {Object} data - Data object for field replacement
   * @param {Object} options - Generation options
   * @returns {jsPDF} Generated PDF document
   */
  generateSingle(stage, data, options = {}) {
    const {
      orientation = "landscape",
      format = "a4",
      backgroundColor = "#ffffff",
      pixelRatio = 2,
      elements = [],
    } = options;

    return this.generateFromStage(stage, {
      orientation,
      format,
      backgroundColor,
      pixelRatio,
      data,
      elements,
    });
  }

  /**
   * Download PDF
   * @param {jsPDF} pdf - PDF document
   * @param {string} filename - Filename for download
   */
  downloadPDF(pdf, filename) {
    if (!pdf) {
      throw new Error("PDF is required");
    }
    pdf.save(filename || "certificate.pdf");
  }

  /**
   * Convert jsPDF object to File for upload
   * @param {jsPDF} pdf - PDF document
   * @param {string} filename - Filename for the file
   * @returns {File} File object ready for FormData upload
   */
  pdfToFile(pdf, filename = "certificate.pdf") {
    if (!pdf) {
      throw new Error("PDF is required");
    }

    // Get PDF as blob
    const blob = pdf.output("blob");

    // Convert to File object
    const file = new File([blob], filename, {
      type: "application/pdf",
    });

    return file;
  }

  /**
   * Generate CSV File from data array
   * @param {Array} csvData - Array of data objects
   * @param {string} filename - Filename for the CSV file
   * @returns {File} File object ready for FormData upload
   */
  generateCSVFile(csvData, filename = "metadata.csv") {
    if (!csvData || csvData.length === 0) {
      throw new Error("CSV data is required");
    }

    // Get headers from first object
    const headers = Object.keys(csvData[0]);

    // Create CSV string
    let csvString = headers.join(",") + "\n";

    // Add rows
    csvData.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header] || "";
        // Escape commas and quotes in values
        if (value.toString().includes(",") || value.toString().includes('"')) {
          return `"${value.toString().replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvString += values.join(",") + "\n";
    });

    // Convert to File object
    const file = new File([csvString], filename, {
      type: "text/csv",
    });

    return file;
  }

  /**
   * Generate CSV file for single document upload
   * Auto-generates CSV with required fields based on PDF filename and user info
   * @param {string} pdfFilename - Name of the PDF file (must match exactly)
   * @param {string} userEmail - User's email address
   * @param {string} title - Document title/course name
   * @param {Object} options - Optional fields
   * @param {string} options.identityBirthday - Birthday (default: "1990-01-01")
   * @param {string} options.identityGender - Gender (default: "Not specified")
   * @param {string} options.course - Course name (default: title)
   * @param {string} options.grade - Grade (optional)
   * @param {string} options.credits - Credits (optional)
   * @param {string} options.gpa - GPA (optional)
   * @param {string} options.completion_date - Completion date (optional)
   * @returns {File} File object ready for FormData upload
   */
  generateSingleDocumentCSV(
    pdfFilename,
    userEmail,
    title = "Certificate",
    options = {}
  ) {
    if (!pdfFilename || !userEmail) {
      throw new Error("PDF filename and user email are required");
    }

    // Prepare CSV row data
    const csvRow = {
      filename: pdfFilename,
      identityEmail: userEmail,
      email: userEmail, // Also include as 'email' for compatibility
      identityBirthday: options.identityBirthday || "1990-01-01",
      birthday: options.identityBirthday || "1990-01-01", // Also include as 'birthday'
      identityGender: options.identityGender || "Not specified",
      gender: options.identityGender || "Not specified", // Also include as 'gender'
      course: options.course || title,
      course_name: options.course || title, // Also include as 'course_name'
      grade: options.grade || "",
      credits: options.credits || "",
      gpa: options.gpa || "",
      completion_date: options.completion_date || new Date().toISOString().split("T")[0],
    };

    // Get all headers
    const headers = Object.keys(csvRow);

    // Create CSV string
    let csvString = headers.join(",") + "\n";

    // Add single row
    const values = headers.map((header) => {
      const value = csvRow[header] || "";
      // Escape commas and quotes in values
      if (value.toString().includes(",") || value.toString().includes('"')) {
        return `"${value.toString().replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvString += values.join(",") + "\n";

    // Convert to File object
    const file = new File([csvString], "metadata.csv", {
      type: "text/csv",
    });

    return file;
  }

  /**
   * Generate preview data URL from stage
   * @param {Object} stage - Konva stage instance
   * @param {Object} options - Generation options
   * @returns {string} Data URL of the preview
   */
  generatePreview(stage, options = {}) {
    const {
      backgroundColor = "#ffffff",
      pixelRatio = 2,
      data = null,
      elements = [],
    } = options;

    if (!stage) {
      throw new Error("Stage is required for preview generation");
    }

    // Hide transformer before capturing (if it exists)
    // Search for transformer in all layers
    let transformer = null;
    let transformerWasVisible = true;
    stage.getLayers().forEach((layer) => {
      const found = layer.find((node) => node.getClassName() === "Transformer");
      if (found && found.length > 0) {
        transformer = found[0];
      }
    });
    
    if (transformer) {
      transformerWasVisible = transformer.visible();
      transformer.visible(false);
      stage.getLayers()[0]?.batchDraw();
    }

    // Store original text values if data is provided
    const originalTexts = {};
    if (data && elements.length > 0) {
      elements.forEach((el) => {
        if (el.type === "text" && el.isDynamic && el.dataField) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            originalTexts[el.id] = textNode.text();
            const value = data[el.dataField] || `{{${el.dataField}}}`;
            textNode.text(value);
          }
        }
      });
      stage.getLayers()[0]?.batchDraw();
    }

    // Generate preview
    const dataURL = stage.toDataURL({
      pixelRatio,
      mimeType: "image/png",
      quality: 1.0,
      backgroundColor,
    });

    // Restore transformer visibility
    if (transformer && transformerWasVisible) {
      transformer.visible(true);
      stage.getLayers()[0]?.batchDraw();
    }

    // Restore original text values
    if (Object.keys(originalTexts).length > 0) {
      elements.forEach((el) => {
        if (originalTexts[el.id]) {
          const textNode = stage.findOne(`#${el.id}`);
          if (textNode) {
            textNode.text(originalTexts[el.id]);
          }
        }
      });
      stage.getLayers()[0]?.batchDraw();
    }

    return dataURL;
  }
}

// Export singleton instance
const konvaPdfGenerator = new KonvaPdfGenerator();
export default konvaPdfGenerator;

