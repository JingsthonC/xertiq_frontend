class TemplateStorageService {
  constructor() {
    this.storageKey = "xertiq_certificate_templates";
  }

  /**
   * Save a template to local storage
   * @param {Object} template - The template to save
   * @returns {boolean} Success status
   */
  saveTemplate(template) {
    try {
      const templates = this.getAllTemplates();

      // Check if template with same name exists
      const existingIndex = templates.findIndex(
        (t) => t.name === template.name
      );

      if (existingIndex >= 0) {
        templates[existingIndex] = {
          ...template,
          updatedAt: new Date().toISOString(),
        };
      } else {
        templates.push({
          ...template,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      localStorage.setItem(this.storageKey, JSON.stringify(templates));
      return true;
    } catch (error) {
      console.error("Error saving template:", error);
      return false;
    }
  }

  /**
   * Get all saved templates
   * @returns {Array} Array of templates
   */
  getAllTemplates() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading templates:", error);
      return [];
    }
  }

  /**
   * Get a specific template by name
   * @param {string} name - Template name
   * @returns {Object|null} Template object or null
   */
  getTemplate(name) {
    try {
      const templates = this.getAllTemplates();
      return templates.find((t) => t.name === name) || null;
    } catch (error) {
      console.error("Error loading template:", error);
      return null;
    }
  }

  /**
   * Delete a template
   * @param {string} name - Template name
   * @returns {boolean} Success status
   */
  deleteTemplate(name) {
    try {
      const templates = this.getAllTemplates();
      const filtered = templates.filter((t) => t.name !== name);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      return false;
    }
  }

  /**
   * Export template as JSON file
   * @param {Object} template - Template to export
   */
  exportTemplate(template) {
    try {
      const dataStr = JSON.stringify(template, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${template.name || "template"}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting template:", error);
    }
  }

  /**
   * Import template from JSON file
   * @param {File} file - JSON file to import
   * @returns {Promise<Object>} Imported template
   */
  importTemplate(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target.result);
          resolve(template);
        } catch {
          reject(new Error("Invalid template file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  /**
   * Clear all templates
   * @returns {boolean} Success status
   */
  clearAllTemplates() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error("Error clearing templates:", error);
      return false;
    }
  }

  /**
   * Duplicate a template with a new name
   * @param {string} sourceName - Name of template to duplicate
   * @param {string} newName - Name for the duplicate
   * @returns {boolean} Success status
   */
  duplicateTemplate(sourceName, newName) {
    try {
      const sourceTemplate = this.getTemplate(sourceName);
      if (!sourceTemplate) {
        return false;
      }

      const duplicateTemplate = {
        ...sourceTemplate,
        name: newName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return this.saveTemplate(duplicateTemplate);
    } catch {
      return false;
    }
  }
}

export default new TemplateStorageService();
