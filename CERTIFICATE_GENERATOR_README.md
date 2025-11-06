# PDF Certificate Generator Feature

## Overview

A comprehensive PDF certificate generation system that allows users to design custom certificate templates, import CSV data, and generate batch PDFs with personalized information.

## Features

### 1. Template Designer

- **Visual Template Editor**: Design certificates with drag-and-drop text elements
- **Customizable Properties**:
  - Text content with placeholder support (`{{fieldName}}`)
  - Position (X, Y coordinates)
  - Font size, style (normal, bold, italic)
  - Text color and alignment (left, center, right)
  - Background color and border settings
- **Logo & Background Images**: Upload and position custom images
- **Template Settings**:
  - Orientation (landscape/portrait)
  - Paper format (A4, Letter, Legal)
  - Border customization
  - Background color

### 2. CSV Data Import

- **Drag & Drop Upload**: Easy CSV file upload interface
- **Data Preview**: View first 5 records before generation
- **Field Detection**: Automatically detects CSV headers as available fields
- **Field Mapping**: Use CSV column names in template placeholders
- **Error Handling**: Validates CSV format and content

### 3. PDF Generation

- **Preview Mode**: Generate preview with first CSV record
- **Batch Generation**: Two generation modes:
  - **Single PDF**: All certificates in one file
  - **Separate Files**: Individual PDF per certificate
- **Dynamic Content**: Replaces placeholders with CSV data
- **Multiple Records**: Processes entire CSV dataset

### 4. Template Management

- **Save Templates**: Store templates in browser localStorage
- **Template Library**: Browse and load saved templates
- **Export/Import**: Download templates as JSON files
- **Delete & Duplicate**: Manage template collection

## Usage Guide

### Step 1: Design Your Certificate Template

1. Navigate to **Dashboard** → **PDF Generator**
2. Click the **Design Template** tab
3. Use the toolbar to add elements:
   - **Add Text**: Insert text fields
   - **Add Logo**: Upload organization logo
   - **Background**: Set background image
4. Configure each text element:
   - Enter text or use placeholders like `{{name}}`, `{{course}}`, `{{date}}`
   - Adjust position (X, Y)
   - Set font size and style
   - Choose color and alignment
5. Configure template settings (click gear icon):
   - Template name
   - Orientation (landscape/portrait)
   - Paper size
   - Background color
   - Border options
6. Click **Save Template** to store for later use

### Step 2: Upload CSV Data

1. Click the **Upload Data** tab
2. Prepare a CSV file with columns matching your placeholders:
   ```csv
   name,course,date,grade
   John Doe,Web Development,2025-10-15,A+
   Jane Smith,Data Science,2025-10-15,A
   ```
3. Drag and drop the CSV file or click **Choose File**
4. Review the data preview and available fields

### Step 3: Generate PDFs

1. Click the **Generate PDFs** tab
2. Click **Generate Preview** to see a sample certificate
3. Review the preview in the iframe viewer
4. Choose generation mode:
   - **Single PDF**: Downloads one file with all certificates
   - **Separate Files**: Downloads individual PDFs (naming: `certificate_{{name}}_{{index}}.pdf`)
5. Click the desired button to generate and download

## CSV Format Requirements

Your CSV file must:

- Have a header row with column names
- Use column names that match placeholders in your template
- Be UTF-8 encoded
- Have consistent data in each row

**Example CSV:**

```csv
name,course,date,instructor,grade
Alice Johnson,Machine Learning,October 16 2025,Dr. Smith,A+
Bob Williams,Cloud Computing,October 16 2025,Dr. Jones,A
Carol Davis,Cybersecurity,October 16 2025,Dr. Brown,B+
```

## Template Placeholders

Use double curly braces to create dynamic fields:

- `{{name}}` - Recipient name
- `{{course}}` - Course name
- `{{date}}` - Issue date
- `{{instructor}}` - Instructor name
- Any CSV column name can be used

## Template Storage

Templates are stored in browser localStorage with the following data:

- Template configuration
- All elements and their properties
- Creation and update timestamps
- Logo and background images (as base64)

**Note**: Templates are browser-specific. Use Export/Import to transfer between browsers or devices.

## File Structure

```
src/
├── pages/
│   └── CertificateGenerator.jsx    # Main page component
├── components/
│   ├── PDFTemplateDesigner.jsx     # Template design interface
│   └── CSVUploader.jsx             # CSV upload component
└── services/
    ├── pdfGenerator.js             # PDF generation logic
    └── templateStorage.js          # Template persistence
```

## API Reference

### pdfGenerator Service

```javascript
// Generate single certificate
const pdf = pdfGenerator.generateSingleCertificate(template, data);

// Generate batch certificates
const pdfs = pdfGenerator.generateBatchCertificates(
  template,
  dataArray,
  separateFiles
);

// Download PDF
pdfGenerator.downloadPDF(pdf, filename);

// Generate preview
const previewUrl = pdfGenerator.generatePreview(template, sampleData);
```

### templateStorage Service

```javascript
// Save template
templateStorage.saveTemplate(template);

// Load all templates
const templates = templateStorage.getAllTemplates();

// Get specific template
const template = templateStorage.getTemplate(name);

// Delete template
templateStorage.deleteTemplate(name);

// Export template
templateStorage.exportTemplate(template);

// Import template
const template = await templateStorage.importTemplate(file);
```

## Tips & Best Practices

1. **Design Tips**:

   - Use landscape orientation for traditional certificates
   - Keep text within border margins (15-20mm)
   - Use larger fonts (24-32pt) for names
   - Center align recipient names for prominence

2. **Data Tips**:

   - Validate CSV data before upload
   - Use consistent date formats
   - Test with a small CSV first
   - Keep column names simple (no spaces or special characters)

3. **Performance**:

   - Large batches (>100) may take time to generate
   - Separate files are slower than single PDF
   - Background images increase file size

4. **Browser Compatibility**:
   - Works in all modern browsers
   - Chrome/Edge recommended for best performance
   - localStorage has ~5MB limit for templates

## Troubleshooting

**Issue**: Preview not showing

- **Solution**: Ensure CSV data is uploaded and contains valid data

**Issue**: Placeholders not replaced

- **Solution**: Check CSV column names match placeholder names exactly

**Issue**: Template not saving

- **Solution**: Enter a template name in settings before saving

**Issue**: PDF generation fails

- **Solution**: Verify template has at least one element and CSV has data

## Future Enhancements

- [ ] QR code integration
- [ ] Signature field support
- [ ] Multiple page templates
- [ ] Cloud template storage
- [ ] Template marketplace
- [ ] Real-time preview while editing
- [ ] Undo/redo functionality
- [ ] Template versioning

## Dependencies

- **jsPDF**: PDF generation library
- **jspdf-autotable**: Table generation for PDFs
- **papaparse**: CSV parsing library
- **react-dropzone**: File upload component (already installed)

## License

This feature is part of the XertiQ frontend application.
