/**
 * CSV Validation for Batch Certificate Generation
 *
 * Validates that CSV has required fields before upload:
 * 1. name (studentName)
 * 2. gender
 * 3. email
 * 4. birthdate
 * 5. documentType (docType)
 * 6. documentId
 *
 * All other fields go into metadata as JSONB
 */

export const REQUIRED_CSV_FIELDS = {
  name: {
    aliases: ["name", "studentName", "student_name", "full_name", "fullname"],
    required: true,
  },
  gender: { aliases: ["gender", "sex"], required: true },
  email: {
    aliases: ["email", "email_address", "identityEmail"],
    required: true,
  },
  birthdate: {
    aliases: [
      "birthdate",
      "birthday",
      "date_of_birth",
      "dob",
      "identityBirthday",
    ],
    required: true,
  },
  documentType: {
    aliases: [
      "documentType",
      "docType",
      "document_type",
      "type",
      "certificateType",
    ],
    required: true,
  },
  documentId: {
    aliases: [
      "documentId",
      "docId",
      "document_id",
      "id",
      "certificate_id",
      "certId",
    ],
    required: true,
  },
};

export class CSVValidationError extends Error {
  constructor(message, missingFields = [], row = null) {
    super(message);
    this.name = "CSVValidationError";
    this.missingFields = missingFields;
    this.row = row;
  }
}

/**
 * Validate CSV headers have all required fields
 */
export function validateCSVHeaders(headers) {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
  const missingFields = [];
  const fieldMapping = {};

  for (const [fieldName, config] of Object.entries(REQUIRED_CSV_FIELDS)) {
    if (!config.required) continue;

    // Check if any alias exists in headers
    const foundHeader = config.aliases.find((alias) =>
      normalizedHeaders.includes(alias.toLowerCase()),
    );

    if (foundHeader) {
      // Map the found header to the standard field name
      const originalHeader =
        headers[normalizedHeaders.indexOf(foundHeader.toLowerCase())];
      fieldMapping[fieldName] = originalHeader;
    } else {
      missingFields.push(fieldName);
    }
  }

  if (missingFields.length > 0) {
    throw new CSVValidationError(
      `Missing required CSV columns: ${missingFields.join(", ")}.\n\nPlease ensure your CSV has columns for:\n• ${Object.keys(REQUIRED_CSV_FIELDS).join("\n• ")}\n\nAccepted column name variations are case-insensitive.`,
      missingFields,
    );
  }

  return fieldMapping;
}

/**
 * Validate individual row has required field values
 */
export function validateCSVRow(row, rowIndex, fieldMapping) {
  const errors = [];

  for (const [fieldName, csvColumn] of Object.entries(fieldMapping)) {
    const value = row[csvColumn];

    if (!value || value.trim() === "") {
      errors.push(`Row ${rowIndex + 1}: Missing value for ${fieldName}`);
    }

    // Additional validation
    if (fieldName === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`Row ${rowIndex + 1}: Invalid email format: ${value}`);
      }
    }

    if (fieldName === "gender" && value) {
      const validGenders = [
        "male",
        "female",
        "m",
        "f",
        "other",
        "prefer not to say",
        "non-binary",
      ];
      if (!validGenders.includes(value.toLowerCase().trim())) {
        errors.push(
          `Row ${rowIndex + 1}: Invalid gender value: ${value}. Use: Male, Female, Other, Non-binary, or Prefer not to say`,
        );
      }
    }

    if (fieldName === "birthdate" && value) {
      // Try to parse as date
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push(
          `Row ${rowIndex + 1}: Invalid birthdate format: ${value}. Use YYYY-MM-DD or MM/DD/YYYY`,
        );
      }
    }
  }

  return errors;
}

/**
 * Validate entire CSV data
 */
export function validateCSVData(csvData) {
  if (!csvData || csvData.length === 0) {
    throw new CSVValidationError("CSV file is empty");
  }

  // Validate headers
  const headers = Object.keys(csvData[0]);
  const fieldMapping = validateCSVHeaders(headers);

  // Validate each row
  const allErrors = [];
  csvData.forEach((row, index) => {
    const rowErrors = validateCSVRow(row, index, fieldMapping);
    allErrors.push(...rowErrors);
  });

  if (allErrors.length > 0) {
    const errorPreview = allErrors.slice(0, 10).join("\n");
    const remainingErrors =
      allErrors.length > 10
        ? `\n... and ${allErrors.length - 10} more errors`
        : "";

    throw new CSVValidationError(
      `CSV validation failed with ${allErrors.length} error(s):\n\n${errorPreview}${remainingErrors}`,
      [],
      allErrors,
    );
  }

  return {
    valid: true,
    fieldMapping,
    rowCount: csvData.length,
    message: `✅ CSV validated successfully: ${csvData.length} rows with all required fields`,
  };
}

/**
 * Normalize CSV data to standard field names
 * Required fields are extracted, all others go to metadata
 */
export function normalizeCSVData(csvData, fieldMapping) {
  return csvData.map((row) => {
    const normalized = {};

    // Map required fields to standard names
    for (const [standardField, csvColumn] of Object.entries(fieldMapping)) {
      normalized[standardField] = row[csvColumn];
    }

    // Put all other fields in metadata
    const metadata = {};
    for (const [key, value] of Object.entries(row)) {
      if (!Object.values(fieldMapping).includes(key)) {
        // Include dynamic fields like course, supervisor, hours, etc.
        metadata[key] = value;
      }
    }

    if (Object.keys(metadata).length > 0) {
      normalized.metadata = metadata;
    }

    return normalized;
  });
}

/**
 * Get user-friendly error message for CSV validation errors
 */
export function getValidationErrorMessage(error) {
  if (!(error instanceof CSVValidationError)) {
    return error.message;
  }

  if (error.missingFields.length > 0) {
    return `Missing required columns: ${error.missingFields.join(", ")}\n\nPlease add these columns to your CSV and try again.`;
  }

  return error.message;
}
