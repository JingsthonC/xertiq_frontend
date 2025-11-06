import jsPDF from "jspdf";

/**
 * Generate pixel-perfect PDF from Fabric.js canvas
 * This ensures what you see is EXACTLY what you get
 */
class CanvasPDFGenerator {
  /**
   * Generate PDF directly from canvas for perfect accuracy
   * @param {Canvas} canvas - Fabric.js canvas instance
   * @param {Object} template - Template configuration
   * @param {Object} data - Data to replace dynamic fields
   * @param {Object} batchInfo - Batch/course information (courseName, batchName)
   * @returns {Blob} PDF blob
   */
  async generateFromCanvas(canvas, template, data = null, batchInfo = null) {
    try {
      console.log("Generating pixel-perfect PDF from canvas");

      // Create a temporary canvas for rendering with data
      const tempCanvas = canvas;

      // Merge data with batch info for field replacement
      const mergedData = { ...data };
      if (batchInfo) {
        // Add batch info to data so it can be used for dynamic fields
        if (batchInfo.courseName) {
          mergedData.course = batchInfo.courseName;
          mergedData.courseName = batchInfo.courseName;
        }
        if (batchInfo.batchName) {
          mergedData.batch = batchInfo.batchName;
          mergedData.batchName = batchInfo.batchName;
        }
      }

      // If data is provided, temporarily replace dynamic field values
      const originalTexts = [];
      if (mergedData && Object.keys(mergedData).length > 0) {
        tempCanvas.getObjects("textbox").forEach((obj) => {
          if (obj.isDynamic && obj.dataField && mergedData[obj.dataField]) {
            originalTexts.push({ obj, originalText: obj.text });
            obj.set("text", mergedData[obj.dataField]);
          }
        });
        tempCanvas.renderAll();
      }

      // Convert canvas to high-quality image
      const imgData = tempCanvas.toDataURL({
        format: "png",
        quality: 1.0,
        multiplier: 2, // 2x resolution for quality
      });

      // Restore original text values
      if (originalTexts.length > 0) {
        originalTexts.forEach(({ obj, originalText }) => {
          obj.set("text", originalText);
        });
        tempCanvas.renderAll();
      }

      // Create PDF with correct dimensions
      const pdf = new jsPDF({
        orientation: template.orientation || "landscape",
        unit: "mm",
        format: template.format || "a4",
      });

      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;

      // Add the canvas image to fill the entire PDF page
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST"
      );

      console.log("✅ Pixel-perfect PDF generated");
      return pdf;
    } catch (error) {
      console.error("Error generating PDF from canvas:", error);
      throw error;
    }
  }

  /**
   * Generate batch PDFs from canvas
   * @param {Canvas} canvas - Fabric.js canvas instance
   * @param {Object} template - Template configuration
   * @param {Array} dataArray - Array of data objects
   * @param {Object} batchInfo - Batch/course information (courseName, batchName)
   * @returns {Array} Array of {pdf, filename, data}
   */
  async generateBatch(canvas, template, dataArray, batchInfo = null) {
    const pdfs = [];

    for (const data of dataArray) {
      const pdf = await this.generateFromCanvas(
        canvas,
        template,
        data,
        batchInfo
      );
      const filename = `certificate-${data.name || Date.now()}.pdf`;
      pdfs.push({ pdf, filename, data });
    }

    return pdfs;
  }
}

const canvasPdfGenerator = new CanvasPDFGenerator();
export default canvasPdfGenerator;
