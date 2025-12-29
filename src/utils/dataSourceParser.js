/**
 * Data Source Parser Utility
 * Handles parsing of CSV and Excel files
 */

import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * Parse CSV file and extract headers and data
 * @param {File} file - CSV file
 * @returns {Promise<Object>} Parsed data with headers and rows
 */
export const parseCSV = async (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0].message));
          return;
        }

        if (results.data.length === 0) {
          reject(new Error("CSV file is empty"));
          return;
        }

        const headers = Object.keys(results.data[0]);
        resolve({
          headers,
          data: results.data,
          totalRows: results.data.length,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
};

/**
 * Parse Excel file and extract headers and data
 * @param {File} file - Excel file (.xlsx or .xls)
 * @returns {Promise<Object>} Parsed data with headers and rows
 */
export const parseExcel = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (jsonData.length === 0) {
      throw new Error("Excel file is empty");
    }

    const headers = Object.keys(jsonData[0]);

    return {
      headers,
      data: jsonData,
      totalRows: jsonData.length,
      sheetName,
    };
  } catch (error) {
    console.error("Excel parsing error:", error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

/**
 * Detect file type and parse accordingly
 * @param {File} file - Data source file
 * @returns {Promise<Object>} Parsed data with headers and rows
 */
export const parseDataSourceFile = async (file) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (
    fileType === "text/csv" ||
    fileName.endsWith(".csv") ||
    fileType === "application/vnd.ms-excel"
  ) {
    return await parseCSV(file);
  } else if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    fileType === "application/vnd.ms-excel" ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".xls")
  ) {
    return await parseExcel(file);
  } else {
    throw new Error(`Unsupported data file type: ${fileType || fileName}`);
  }
};

/**
 * Validate required columns in data source
 * @param {Array<string>} headers - Column headers
 * @param {Array<string>} requiredColumns - Required column names
 * @returns {Object} Validation result
 */
export const validateColumns = (headers, requiredColumns = []) => {
  if (requiredColumns.length === 0) {
    return { valid: true, missing: [] };
  }

  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
  const normalizedRequired = requiredColumns.map((c) => c.toLowerCase().trim());

  const missing = normalizedRequired.filter(
    (req) => !normalizedHeaders.includes(req)
  );

  return {
    valid: missing.length === 0,
    missing: missing.map((m) => {
      // Find original case from headers
      const original = headers.find((h) => h.toLowerCase().trim() === m);
      return original || m;
    }),
  };
};




