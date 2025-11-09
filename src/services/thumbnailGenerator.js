class ThumbnailGenerator {
  /**
   * Generate a thumbnail preview image from a template
   * @param {Object} template - The template object
   * @param {number} maxWidth - Maximum width of thumbnail (default 400)
   * @param {number} maxHeight - Maximum height of thumbnail (default 300)
   * @returns {Promise<string>} Base64 data URL of thumbnail
   */
  async generateFromTemplate(template, maxWidth = 400, maxHeight = 300) {
    try {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Get template dimensions
      const isLandscape = template.orientation === "landscape";
      const templateWidth = isLandscape ? 297 : 210; // A4 in mm
      const templateHeight = isLandscape ? 210 : 297;

      // Calculate scale to fit within max dimensions
      const scaleX = maxWidth / templateWidth;
      const scaleY = maxHeight / templateHeight;
      const scale = Math.min(scaleX, scaleY);

      // Set canvas size
      canvas.width = templateWidth * scale;
      canvas.height = templateHeight * scale;

      // Fill background
      ctx.fillStyle = template.backgroundColor || "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background image if exists
      if (template.backgroundImage) {
        try {
          const img = await this.loadImage(template.backgroundImage);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } catch (error) {
          console.warn("Failed to load background image for thumbnail:", error);
        }
      }

      // Draw elements
      if (template.elements && template.elements.length > 0) {
        for (const element of template.elements) {
          try {
            await this.drawElement(ctx, element, scale);
          } catch (error) {
            console.warn("Failed to draw element in thumbnail:", error);
          }
        }
      }

      // Convert to data URL
      return canvas.toDataURL("image/jpeg", 0.8);
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      // Return a placeholder image
      return this.generatePlaceholder(maxWidth, maxHeight);
    }
  }

  /**
   * Draw a single element on the canvas
   */
  async drawElement(ctx, element, scale) {
    switch (element.type) {
      case "text":
        this.drawText(ctx, element, scale);
        break;
      case "image":
        await this.drawImage(ctx, element, scale);
        break;
      case "rectangle":
        this.drawRectangle(ctx, element, scale);
        break;
      case "line":
        this.drawLine(ctx, element, scale);
        break;
      default:
        console.warn("Unknown element type:", element.type);
    }
  }

  /**
   * Draw text element
   */
  drawText(ctx, element, scale) {
    const x = element.x * scale;
    const y = element.y * scale;
    const fontSize = (element.fontSize || 16) * scale;

    ctx.save();

    // Set font
    const fontWeight = element.bold ? "bold" : "normal";
    const fontStyle = element.italic ? "italic" : "normal";
    const fontFamily = element.font || "Arial";
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

    // Set color
    ctx.fillStyle = element.color || "#000000";

    // Set alignment
    ctx.textAlign = element.align || "left";
    ctx.textBaseline = "top";

    // Apply rotation if exists
    if (element.rotation) {
      ctx.translate(x, y);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.fillText(element.text || "Text", 0, 0);
    } else {
      ctx.fillText(element.text || "Text", x, y);
    }

    ctx.restore();
  }

  /**
   * Draw image element
   */
  async drawImage(ctx, element, scale) {
    const x = element.x * scale;
    const y = element.y * scale;
    const width = (element.width || 50) * scale;
    const height = (element.height || 50) * scale;

    try {
      const img = await this.loadImage(element.src);
      ctx.save();

      if (element.rotation) {
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
      } else {
        ctx.drawImage(img, x, y, width, height);
      }

      ctx.restore();
    } catch {
      // Draw placeholder rectangle if image fails to load
      ctx.fillStyle = "#e0e0e0";
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = "#999";
      ctx.strokeRect(x, y, width, height);
    }
  }

  /**
   * Draw rectangle element
   */
  drawRectangle(ctx, element, scale) {
    const x = element.x * scale;
    const y = element.y * scale;
    const width = (element.width || 50) * scale;
    const height = (element.height || 50) * scale;

    ctx.save();

    if (element.rotation) {
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(-(width / 2), -(height / 2));
    } else {
      ctx.translate(x, y);
    }

    // Fill if fillColor exists
    if (element.fillColor && element.fillColor !== "transparent") {
      ctx.fillStyle = element.fillColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Stroke if borderColor exists
    if (element.borderColor) {
      ctx.strokeStyle = element.borderColor;
      ctx.lineWidth = (element.borderWidth || 1) * scale;
      ctx.strokeRect(0, 0, width, height);
    }

    ctx.restore();
  }

  /**
   * Draw line element
   */
  drawLine(ctx, element, scale) {
    const x = element.x * scale;
    const y = element.y * scale;
    const width = (element.width || 100) * scale;

    ctx.save();
    ctx.strokeStyle = element.color || "#000000";
    ctx.lineWidth = (element.thickness || 1) * scale;

    if (element.rotation) {
      ctx.translate(x, y);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Load an image from URL
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Generate a placeholder image
   */
  generatePlaceholder(width = 400, height = 300) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Template", width / 2, height / 2);

    return canvas.toDataURL("image/jpeg", 0.8);
  }

  /**
   * Generate thumbnail from a Fabric.js canvas
   */
  async generateFromFabricCanvas(
    fabricCanvas,
    maxWidth = 400,
    maxHeight = 300
  ) {
    try {
      // Get the canvas as data URL
      const dataUrl = fabricCanvas.toDataURL({
        format: "jpeg",
        quality: 0.8,
        multiplier: Math.min(
          maxWidth / fabricCanvas.width,
          maxHeight / fabricCanvas.height
        ),
      });
      return dataUrl;
    } catch (error) {
      console.error("Error generating thumbnail from Fabric canvas:", error);
      return this.generatePlaceholder(maxWidth, maxHeight);
    }
  }
}

export default new ThumbnailGenerator();
