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

      // Calculate scale to fit within max dimensions (with padding to ensure nothing is cut off)
      const padding = 0; // No padding, use exact fit
      const availableWidth = maxWidth - (padding * 2);
      const availableHeight = maxHeight - (padding * 2);
      const scaleX = availableWidth / templateWidth;
      const scaleY = availableHeight / templateHeight;
      const scale = Math.min(scaleX, scaleY); // Use smaller scale to ensure everything fits

      // Set canvas size to exact fit
      canvas.width = templateWidth * scale;
      canvas.height = templateHeight * scale;

      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

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
    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    let x = element.x * scale;
    const y = element.y * scale;
    const fontSize = (element.fontSize || 16) * scale;
    const text = element.text || "Text";

    ctx.save();

    // Set font
    const fontWeight = element.bold ? "bold" : "normal";
    const fontStyle = element.italic ? "italic" : "normal";
    const fontFamily = element.font || "Arial";
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

    // Set color
    ctx.fillStyle = element.color || "#000000";

    // Set alignment
    const align = element.align || "left";
    ctx.textAlign = align;
    ctx.textBaseline = "top";

    // Calculate text width for positioning and clipping
    const textWidth = ctx.measureText(text).width;
    const maxWidth = element.width ? element.width * scale : canvasWidth;

    // For centered text, use canvas center
    if (align === "center") {
      x = canvasWidth / 2;
    } else if (align === "right") {
      // For right-aligned, position from right edge
      // element.x in template is from left, so we need to calculate from right
      const templateWidth = canvasWidth / scale; // Original template width in mm
      const rightEdgeX = templateWidth - element.x; // Distance from right edge in mm
      x = canvasWidth - (rightEdgeX * scale);
    }
    // For left-aligned, x is already calculated correctly as element.x * scale

    // Clipping to prevent text from going outside canvas bounds
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, canvasHeight);
    ctx.clip();

    // Apply rotation if exists
    if (element.rotation) {
      ctx.translate(x, y);
      ctx.rotate((element.rotation * Math.PI) / 180);
      // Use maxWidth for text wrapping if specified
      if (element.width) {
        ctx.fillText(text, 0, 0, maxWidth);
      } else {
        ctx.fillText(text, 0, 0);
      }
    } else {
      // Use maxWidth for text wrapping if specified
      if (element.width) {
        ctx.fillText(text, x, y, maxWidth);
      } else {
        ctx.fillText(text, x, y);
      }
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
