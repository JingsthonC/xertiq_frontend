/**
 * Smart Positioning Algorithm
 * Intelligently positions data fields based on template structure
 */

/**
 * Detect potential data fields in template text
 * @param {Array} elements - Template elements
 * @returns {Array} Detected field names
 */
export const detectDataFields = (elements) => {
  const fieldPatterns = [
    /{{(\w+)}}/g, // {{fieldName}}
    /\{(\w+)\}/g, // {fieldName}
    /\[(\w+)\]/g, // [fieldName]
    /<(\w+)>/g, // <fieldName>
  ];

  const detectedFields = new Set();

  elements.forEach((element) => {
    if (element.type === "text" && element.text) {
      fieldPatterns.forEach((pattern) => {
        const matches = element.text.matchAll(pattern);
        for (const match of matches) {
          detectedFields.add(match[1].toLowerCase());
        }
      });
    }
  });

  return Array.from(detectedFields);
};

/**
 * Match CSV/Excel headers with template placeholders
 * @param {Array<string>} dataHeaders - Headers from data source
 * @param {Array<string>} templateFields - Fields detected in template
 * @returns {Object} Mapping between data headers and template fields
 */
export const matchHeadersToFields = (dataHeaders, templateFields) => {
  const mapping = {};
  const normalizedDataHeaders = dataHeaders.map((h) => h.toLowerCase().trim());
  const normalizedTemplateFields = templateFields.map((f) => f.toLowerCase());

  // Direct matches
  normalizedTemplateFields.forEach((templateField) => {
    const matchIndex = normalizedDataHeaders.findIndex(
      (header) => header === templateField
    );
    if (matchIndex !== -1) {
      mapping[templateField] = dataHeaders[matchIndex];
    }
  });

  // Fuzzy matching for common variations
  const fuzzyMatches = {
    name: ["name", "fullname", "full_name", "student_name", "studentname"],
    email: ["email", "e_mail", "email_address", "identityemail"],
    date: ["date", "issued_date", "issue_date", "date_issued"],
    course: ["course", "course_name", "coursename"],
    grade: ["grade", "score", "marks"],
  };

  Object.keys(fuzzyMatches).forEach((key) => {
    if (normalizedTemplateFields.includes(key)) {
      const variations = fuzzyMatches[key];
      const found = normalizedDataHeaders.find((header) =>
        variations.some((v) => header.includes(v))
      );
      if (found && !mapping[key]) {
        mapping[key] = found;
      }
    }
  });

  return mapping;
};

/**
 * Smart positioning: Place data fields near similar template text
 * @param {Array} templateElements - Template elements
 * @param {Array<string>} dataHeaders - Headers from data source
 * @param {Object} headerMapping - Mapping between headers and template fields
 * @returns {Array} Elements with smart positioning
 */
export const applySmartPositioning = (
  templateElements,
  dataHeaders,
  headerMapping
) => {
  const newElements = [...templateElements];
  const usedPositions = new Set();

  // Get existing element positions
  templateElements.forEach((el) => {
    if (el.type === "text") {
      usedPositions.add(`${Math.round(el.x)}-${Math.round(el.y)}`);
    }
  });

  // Find positions for unmapped headers
  dataHeaders.forEach((header) => {
    const normalizedHeader = header.toLowerCase().trim();
    const isMapped = Object.values(headerMapping).some(
      (mapped) => mapped.toLowerCase().trim() === normalizedHeader
    );

    if (!isMapped) {
      // Find a good position near existing text elements
      let bestPosition = findBestPosition(templateElements, usedPositions);

      // Create a new text element for this header
      const newElement = {
        id: `element-${Date.now()}-${Math.random()}`,
        type: "text",
        text: `{{${normalizedHeader}}}`,
        x: bestPosition.x,
        y: bestPosition.y,
        width: 150,
        height: 20,
        fontSize: 12,
        font: "helvetica",
        color: "#000000",
        align: "left",
        isDynamic: true,
        dataField: normalizedHeader,
      };

      newElements.push(newElement);
      usedPositions.add(
        `${Math.round(bestPosition.x)}-${Math.round(bestPosition.y)}`
      );
    } else {
      // Update existing elements that match
      const mappedField = Object.keys(headerMapping).find(
        (key) => headerMapping[key].toLowerCase().trim() === normalizedHeader
      );

      if (mappedField) {
        newElements.forEach((el) => {
          if (
            el.type === "text" &&
            (el.text.includes(`{{${mappedField}}}`) ||
              el.text.includes(`{${mappedField}}`) ||
              el.text.toLowerCase().includes(mappedField))
          ) {
            el.isDynamic = true;
            el.dataField = normalizedHeader;
            // Update placeholder format
            if (el.text.includes(`{{${mappedField}}}`)) {
              el.text = el.text.replace(
                new RegExp(`{{${mappedField}}}`, "gi"),
                `{{${normalizedHeader}}}`
              );
            }
          }
        });
      }
    }
  });

  return newElements;
};

/**
 * Find best position for new element
 * @param {Array} existingElements - Existing template elements
 * @param {Set} usedPositions - Already used positions
 * @returns {Object} Position coordinates {x, y}
 */
const findBestPosition = (existingElements, usedPositions) => {
  const a4Width = 210; // mm
  const a4Height = 297; // mm

  // If no elements, place in center
  if (existingElements.length === 0) {
    return { x: a4Width / 2 - 75, y: a4Height / 2 };
  }

  // Find the lowest Y position
  const maxY = Math.max(
    ...existingElements.map((el) => el.y + (el.height || 20)),
    50
  );

  // Try to place below existing elements
  let y = maxY + 30;
  let x = 20;

  // Check if position is available
  const positionKey = `${Math.round(x)}-${Math.round(y)}`;
  if (usedPositions.has(positionKey)) {
    // Try next column
    x = 110;
    y = maxY + 30;
  }

  // Ensure within bounds
  if (y > a4Height - 30) {
    y = 50;
    x = x === 20 ? 110 : 20;
  }

  return { x, y };
};

/**
 * Auto-detect and mark dynamic fields in template
 * @param {Array} elements - Template elements
 * @param {Array<string>} dataHeaders - Available data headers
 * @returns {Array} Updated elements with dynamic fields marked
 */
export const autoDetectDynamicFields = (elements, dataHeaders) => {
  const normalizedHeaders = dataHeaders.map((h) => h.toLowerCase().trim());

  return elements.map((element) => {
    if (element.type === "text" && element.text) {
      // Check for placeholder patterns
      const placeholderPattern = /{{(\w+)}}|\{(\w+)\}|\[(\w+)\]|<(\w+)>/gi;
      const matches = [...element.text.matchAll(placeholderPattern)];

      if (matches.length > 0) {
        matches.forEach((match) => {
          const fieldName = (match[1] || match[2] || match[3] || match[4])
            .toLowerCase()
            .trim();

          // Check if field exists in data headers
          if (normalizedHeaders.includes(fieldName)) {
            element.isDynamic = true;
            element.dataField = fieldName;
          }
        });
      }

      // Also check if text matches a header name (for smart detection)
      const textLower = element.text.toLowerCase().trim();
      const matchingHeader = normalizedHeaders.find(
        (header) => textLower.includes(header) || header.includes(textLower)
      );

      if (matchingHeader && !element.isDynamic) {
        // Suggest making it dynamic
        element.suggestedField = matchingHeader;
      }
    }

    return element;
  });
};





