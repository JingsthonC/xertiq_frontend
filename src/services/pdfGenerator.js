import jsPDF from "jspdf";
import "jspdf-autotable";

class PDFGeneratorService {
  /**
   * Generate a single PDF certificate from a template and data
   * @param {Object} template - The certificate template configuration
   * @param {Object} data - The data to populate the certificate
   * @returns {jsPDF} The generated PDF document
   */
  generateSingleCertificate(template, data) {
    const pdf = new jsPDF({
      orientation: template.orientation || "landscape",
      unit: "mm",
      format: template.format || "a4",
    });

    // Set background color if specified
    if (template.backgroundColor) {
      pdf.setFillColor(template.backgroundColor);
      pdf.rect(
        0,
        0,
        pdf.internal.pageSize.width,
        pdf.internal.pageSize.height,
        "F"
      );
    }

    // Add background image if specified
    if (template.backgroundImage) {
      try {
        pdf.addImage(
          template.backgroundImage,
          "PNG",
          0,
          0,
          pdf.internal.pageSize.width,
          pdf.internal.pageSize.height
        );
      } catch (error) {
        console.error("Error adding background image:", error);
      }
    }

    // Add logo if specified
    if (template.logo && template.logo.image) {
      try {
        pdf.addImage(
          template.logo.image,
          "PNG",
          template.logo.x || 10,
          template.logo.y || 10,
          template.logo.width || 30,
          template.logo.height || 30
        );
      } catch (error) {
        console.error("Error adding logo:", error);
      }
    }

    // Add text elements
    if (template.elements && template.elements.length > 0) {
      template.elements.forEach((element) => {
        this.addElement(pdf, element, data);
      });
    }

    // Add border if specified
    if (template.border) {
      pdf.setDrawColor(template.border.color || "#000000");
      pdf.setLineWidth(template.border.width || 1);
      pdf.rect(
        template.border.margin || 10,
        template.border.margin || 10,
        pdf.internal.pageSize.width - 2 * (template.border.margin || 10),
        pdf.internal.pageSize.height - 2 * (template.border.margin || 10)
      );
    }

    return pdf;
  }

  /**
   * Add any element to the PDF (text, image, rectangle, line)
   * @param {jsPDF} pdf - The PDF document
   * @param {Object} element - The element configuration
   * @param {Object} data - The data to populate placeholders
   */
  addElement(pdf, element, data) {
    if (element.type === "text") {
      this.addTextElement(pdf, element, data);
    } else if (element.type === "image") {
      this.addImageElement(pdf, element);
    } else if (element.type === "rectangle") {
      this.addRectangleElement(pdf, element);
    } else if (element.type === "line") {
      this.addLineElement(pdf, element);
    }
  }

  /**
   * Add a text element to the PDF
   * @param {jsPDF} pdf - The PDF document
   * @param {Object} element - The text element configuration
   * @param {Object} data - The data to populate placeholders
   */
  addTextElement(pdf, element, data) {
    // Replace placeholders with actual data
    let text = element.text;

    // Handle dynamic fields (isDynamic flag)
    if (element.isDynamic && element.dataField && data[element.dataField]) {
      text = data[element.dataField];
    } else if (element.dataField && data[element.dataField]) {
      text = data[element.dataField];
    } else {
      // Replace all {{field}} placeholders
      text = text.replace(/\{\{(\w+)\}\}/g, (match, field) => {
        return data[field] || match;
      });
    }

    // Debug logging for centered text
    if (element.align === "center") {
      console.log("PDF Text Element (centered):", {
        text: text.substring(0, 30),
        x: element.x,
        y: element.y,
        fontSize: element.fontSize,
        font: element.font,
        align: element.align,
        pageWidth: pdf.internal.pageSize.width,
      });
    }

    // Set text properties
    pdf.setFontSize(element.fontSize || 16);

    // Handle font style (bold, italic, bolditalic, normal)
    let fontStyle = "normal";
    if (element.fontStyle) {
      if (
        element.fontStyle.includes("bold") &&
        element.fontStyle.includes("italic")
      ) {
        fontStyle = "bolditalic";
      } else if (element.fontStyle.includes("bold")) {
        fontStyle = "bold";
      } else if (element.fontStyle.includes("italic")) {
        fontStyle = "italic";
      }
    }

    // Map fonts to jsPDF supported fonts
    let pdfFont = "helvetica"; // default
    if (element.font) {
      const fontLower = element.font.toLowerCase();
      if (fontLower.includes("times")) {
        pdfFont = "times";
      } else if (fontLower.includes("courier")) {
        pdfFont = "courier";
      } else if (fontLower.includes("georgia") || fontLower.includes("serif")) {
        pdfFont = "times"; // Georgia maps to Times (closest serif)
      } else {
        pdfFont = "helvetica"; // Arial, sans-serif fonts
      }
    }

    pdf.setFont(pdfFont, fontStyle);

    // Convert hex color to RGB
    const color = this.hexToRgb(element.color || "#000000");
    pdf.setTextColor(color.r, color.g, color.b);

    // Calculate position based on alignment
    let x = element.x || 20;

    // Better Y baseline calculation - jsPDF measures from baseline, Fabric.js from top
    // Use a smaller multiplier for more accurate positioning
    const y = (element.y || 20) + (element.fontSize || 16) * 0.35;

    if (element.align === "center") {
      // ALWAYS use page center for centered text to ensure perfect centering
      // This ignores the saved X and uses the actual PDF page center
      const pageCenter = pdf.internal.pageSize.width / 2;
      x = pageCenter;

      console.log("Rendering centered text:", {
        text: text.substring(0, 30),
        "element.x (ignored)": element.x,
        "pageCenter (used)": pageCenter,
        y: y,
        fontSize: element.fontSize,
        pageWidth: pdf.internal.pageSize.width,
        pageHeight: pdf.internal.pageSize.height,
      });
    } else if (element.align === "right") {
      const textWidth = pdf.getTextWidth(text);
      x = pdf.internal.pageSize.width - textWidth - (element.x || 20);
    }

    // Add text with alignment option
    pdf.text(text, x, y, { align: element.align || "left" });
  }

  /**
   * Add an image element to the PDF
   * @param {jsPDF} pdf - The PDF document
   * @param {Object} element - The image element configuration
   */
  addImageElement(pdf, element) {
    if (!element.image) return;

    try {
      pdf.addImage(
        element.image,
        "PNG",
        element.x || 10,
        element.y || 10,
        element.width || 50,
        element.height || 50
      );
    } catch (error) {
      console.error("Error adding image element:", error);
    }
  }

  /**
   * Add a rectangle element to the PDF
   * @param {jsPDF} pdf - The PDF document
   * @param {Object} element - The rectangle element configuration
   */
  addRectangleElement(pdf, element) {
    const color = this.hexToRgb(element.color || "#000000");

    if (element.filled) {
      pdf.setFillColor(color.r, color.g, color.b);
      pdf.rect(
        element.x || 10,
        element.y || 10,
        element.width || 50,
        element.height || 50,
        "F"
      );
    } else {
      pdf.setDrawColor(color.r, color.g, color.b);
      pdf.setLineWidth(element.borderWidth || 1);
      pdf.rect(
        element.x || 10,
        element.y || 10,
        element.width || 50,
        element.height || 50
      );
    }
  }

  /**
   * Add a line element to the PDF
   * @param {jsPDF} pdf - The PDF document
   * @param {Object} element - The line element configuration
   */
  addLineElement(pdf, element) {
    const color = this.hexToRgb(element.color || "#000000");
    pdf.setDrawColor(color.r, color.g, color.b);
    pdf.setLineWidth(element.height || 1);
    pdf.line(
      element.x || 10,
      element.y || 10,
      (element.x || 10) + (element.width || 100),
      element.y || 10
    );
  }

  /**
   * Generate multiple PDF certificates from a template and CSV data
   * @param {Object} template - The certificate template configuration
   * @param {Array} dataArray - Array of data objects from CSV
   * @param {boolean} separateFiles - If true, generate separate PDFs; otherwise, combine into one
   * @returns {Array|jsPDF} Array of PDFs or single combined PDF
   */
  generateBatchCertificates(template, dataArray, separateFiles = false) {
    if (separateFiles) {
      return dataArray.map((data) =>
        this.generateSingleCertificate(template, data)
      );
    } else {
      const pdf = new jsPDF({
        orientation: template.orientation || "landscape",
        unit: "mm",
        format: template.format || "a4",
      });

      dataArray.forEach((data, index) => {
        if (index > 0) {
          pdf.addPage();
        }

        // Set background color if specified
        if (template.backgroundColor) {
          pdf.setFillColor(template.backgroundColor);
          pdf.rect(
            0,
            0,
            pdf.internal.pageSize.width,
            pdf.internal.pageSize.height,
            "F"
          );
        }

        // Add background image if specified
        if (template.backgroundImage) {
          try {
            pdf.addImage(
              template.backgroundImage,
              "PNG",
              0,
              0,
              pdf.internal.pageSize.width,
              pdf.internal.pageSize.height
            );
          } catch (error) {
            console.error("Error adding background image:", error);
          }
        }

        // Add logo if specified
        if (template.logo && template.logo.image) {
          try {
            pdf.addImage(
              template.logo.image,
              "PNG",
              template.logo.x || 10,
              template.logo.y || 10,
              template.logo.width || 30,
              template.logo.height || 30
            );
          } catch (error) {
            console.error("Error adding logo:", error);
          }
        }

        // Add text elements
        if (template.elements && template.elements.length > 0) {
          template.elements.forEach((element) => {
            this.addElement(pdf, element, data);
          });
        }

        // Add border if specified
        if (template.border) {
          pdf.setDrawColor(template.border.color || "#000000");
          pdf.setLineWidth(template.border.width || 1);
          pdf.rect(
            template.border.margin || 10,
            template.border.margin || 10,
            pdf.internal.pageSize.width - 2 * (template.border.margin || 10),
            pdf.internal.pageSize.height - 2 * (template.border.margin || 10)
          );
        }
      });

      return pdf;
    }
  }

  /**
   * Download a single PDF
   * @param {jsPDF} pdf - The PDF document
   * @param {string} filename - The filename for download
   */
  downloadPDF(pdf, filename = "certificate.pdf") {
    pdf.save(filename);
  }

  /**
   * Download multiple PDFs as separate files
   * @param {Array} pdfs - Array of PDF documents
   * @param {Array} dataArray - Array of data objects (for filename generation)
   * @param {string} filenameTemplate - Template for filenames (e.g., "certificate_{{name}}.pdf")
   */
  downloadBatchPDFs(
    pdfs,
    dataArray,
    filenameTemplate = "certificate_{{index}}.pdf"
  ) {
    pdfs.forEach((pdf, index) => {
      const data = dataArray[index];
      let filename = filenameTemplate.replace(
        /\{\{(\w+)\}\}/g,
        (match, field) => {
          if (field === "index") return index + 1;
          return data[field] || match;
        }
      );

      // Ensure .pdf extension
      if (!filename.endsWith(".pdf")) {
        filename += ".pdf";
      }

      pdf.save(filename);
    });
  }

  /**
   * Generate a preview of the certificate (returns data URL)
   * @param {Object} template - The certificate template configuration
   * @param {Object} sampleData - Sample data for preview
   * @returns {string} Data URL of the PDF preview
   */
  generatePreview(template, sampleData) {
    const pdf = this.generateSingleCertificate(template, sampleData);
    return pdf.output("dataurlstring");
  }

  /**
   * Convert hex color to RGB
   * @param {string} hex - Hex color code
   * @returns {Object} RGB color object
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  /**
   * Load image as base64 data URL
   * @param {File} file - Image file
   * @returns {Promise<string>} Base64 data URL
   */
  loadImageAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get default certificate template
   * @returns {Object} Default template configuration
   */
  getDefaultTemplate() {
    return {
      name: "Default Certificate",
      orientation: "landscape",
      format: "a4",
      backgroundColor: "#ffffff",
      border: {
        width: 2,
        color: "#1e40af",
        margin: 15,
      },
      logo: null,
      backgroundImage: null,
      elements: [
        {
          id: "title",
          text: "Certificate of Achievement",
          x: 0,
          y: 40,
          fontSize: 32,
          font: "helvetica",
          fontStyle: "bold",
          color: "#1e40af",
          align: "center",
        },
        {
          id: "subtitle",
          text: "This is to certify that",
          x: 0,
          y: 70,
          fontSize: 16,
          font: "helvetica",
          fontStyle: "normal",
          color: "#000000",
          align: "center",
        },
        {
          id: "recipient",
          text: "{{name}}",
          dataField: "name",
          x: 0,
          y: 95,
          fontSize: 28,
          font: "helvetica",
          fontStyle: "bold",
          color: "#000000",
          align: "center",
        },
        {
          id: "description",
          text: "has successfully completed {{course}}",
          x: 0,
          y: 120,
          fontSize: 14,
          font: "helvetica",
          fontStyle: "normal",
          color: "#000000",
          align: "center",
        },
        {
          id: "date",
          text: "Date: {{date}}",
          dataField: "date",
          x: 40,
          y: 170,
          fontSize: 12,
          font: "helvetica",
          fontStyle: "normal",
          color: "#000000",
          align: "left",
        },
      ],
    };
  }
}

export default new PDFGeneratorService();
