# 🚀 Fabric.js Designer - Batch PDF Generation Features

## ✅ Issues Fixed

### 1. **Toolbar Z-Index Fixed**

- ✅ Tools are now properly visible (not behind other elements)
- ✅ Tooltips show on hover with proper positioning

### 2. **Bring to Front/Send to Back Now Working**

- ✅ Fixed the layer management functions
- ✅ Uses correct Fabric.js API: `object.bringToFront()` and `object.sendToBack()`
- ✅ Automatically saves state after z-index changes

## 🎨 New Features Added

### 1. **Image/Signature Upload** 📷

**Button:** Purple upload icon in toolbar
**Features:**

- Upload any image (PNG, JPG, SVG, etc.)
- Automatically scales to reasonable size (100mm max)
- Can be positioned, resized, and rotated like any other element
- **Perfect for digital signatures!**

**Usage:**

1. Click the upload icon (purple)
2. Select an image file
3. Image appears on canvas
4. Drag to position, resize corners, rotate

### 2. **CSV Data Upload & Batch Generation** 📊

**Button:** Orange FileText icon in toolbar
**Features:**

- Upload CSV file with student/recipient data
- Preview data in modal before generating
- Maps text fields to CSV columns
- Generates multiple PDFs automatically

**CSV Format Example:**

```csv
name,email,course,date,grade
John Doe,john@example.com,Web Development,2025-10-17,A+
Jane Smith,jane@example.com,Data Science,2025-10-17,A
```

**Usage:**

1. Click the CSV icon (orange)
2. Upload your CSV file
3. Review data in the modal
4. Click "Generate X PDFs"
5. System creates one PDF per row

### 3. **Dynamic Field Mapping** 🔗

**Location:** Properties panel (when text is selected)
**Features:**

- Link text elements to CSV columns
- Visual indicator when field is mapped
- Automatic replacement during batch generation

**How to Map Fields:**

1. Select a text element
2. Scroll to "Dynamic Field (CSV)" section
3. Enter the CSV column name (e.g., "name", "email", "date")
4. Green checkmark appears: "✓ Will be replaced with CSV data"
5. During batch generation, this text will be replaced with CSV values

**Example:**

- Text on canvas: "John Doe"
- Map to field: "name"
- CSV has: `name,email`
- Result: Each PDF gets the name from that row

## 📋 Complete Feature List

### Design Tools

- ✅ Add Text (with full typography controls)
- ✅ Add Rectangle (shapes with fill/stroke)
- ✅ Add Line (borders, dividers)
- ✅ **NEW:** Add Image/Signature
- ✅ **NEW:** Upload CSV Data

### Element Operations

- ✅ Duplicate (copy selected element)
- ✅ Delete (remove selected element)
- ✅ **FIXED:** Bring to Front (move to top layer)
- ✅ **FIXED:** Send to Back (move to bottom layer)

### Text Properties

- ✅ Font Family (10 fonts: Arial, Helvetica, Times, Georgia, etc.)
- ✅ Font Size (8-120px with slider + number input)
- ✅ Bold/Italic toggle buttons
- ✅ Text Alignment (Left/Center/Right)
- ✅ Text Color (color picker + hex input)
- ✅ **NEW:** Dynamic Field Mapping for CSV

### Shape Properties

- ✅ Fill Color (solid colors)
- ✅ Border Color (stroke)
- ✅ Border Width (0-20px)

### Canvas Features

- ✅ Auto-scaling to fit available space
- ✅ Drag to move elements
- ✅ Resize handles on corners
- ✅ Rotation handles
- ✅ Double-click text to edit inline
- ✅ Selection indicators

## 🎯 Batch PDF Workflow

### Step 1: Design Template

1. Create your certificate design
2. Add static text (title, descriptions)
3. Add placeholders for dynamic data

### Step 2: Map Dynamic Fields

1. Select text that should change per recipient
2. Enter CSV column name in "Dynamic Field" input
3. Repeat for all dynamic fields (name, date, grade, etc.)

### Step 3: Upload CSV

1. Prepare CSV with all recipient data
2. First row = column headers
3. Subsequent rows = recipient data
4. Click CSV upload button
5. Select your CSV file

### Step 4: Review & Generate

1. Modal shows preview of loaded data
2. Verify column names match your mappings
3. Click "Generate X PDFs" button
4. System creates one PDF per CSV row

### Step 5: Download

- PDFs can be downloaded individually
- Or zipped for batch download
- Ready to upload to your batch endpoints

## 🔐 Digital Signature Feature

### Adding Signatures:

1. **Prepare signature image:**

   - PNG with transparent background (recommended)
   - Or JPG/SVG format
   - Resolution: 300+ DPI for print quality

2. **Upload to template:**

   - Click upload icon (purple)
   - Select signature file
   - Position where needed (bottom right, center, etc.)
   - Resize to appropriate size

3. **For batch generation:**
   - If same signature for all: Just add once to template
   - If different signatures: Add as image element, map to CSV column with image URLs

## 📁 File Structure

### Template Format:

```javascript
{
  name: "Certificate Template",
  orientation: "landscape",
  format: "a4",
  backgroundColor: "#ffffff",
  elements: [
    {
      type: "text",
      text: "Certificate Title",
      isDynamic: false,
      x: 148, y: 30,
      fontSize: 32,
      fontFamily: "Arial",
      color: "#1e40af"
    },
    {
      type: "text",
      text: "{{name}}",
      isDynamic: true,
      dataField: "name",
      x: 148, y: 100,
      fontSize: 24
    },
    {
      type: "image",
      src: "data:image/png;base64,...",
      x: 250, y: 180,
      width: 50, height: 30
    }
  ]
}
```

### CSV Format:

```csv
name,email,course,date,grade,signature_url
John Doe,john@example.com,Web Dev,Oct 17 2025,A+,https://...
Jane Smith,jane@example.com,Data Sci,Oct 17 2025,A,https://...
```

## 🎨 Design Best Practices

### Typography:

- **Titles:** 32-48px, Bold, Center-aligned
- **Subtitles:** 16-20px, Normal weight
- **Names:** 24-32px, Bold or Normal
- **Body text:** 12-16px

### Colors:

- **Professional:** Navy (#1e40af), Gold (#f59e0b)
- **Academic:** Dark blue, Burgundy
- **Modern:** Gradients, Vibrant colors

### Layout:

- **Landscape A4:** 297mm × 210mm
- **Margins:** 20mm on all sides recommended
- **Signature:** Bottom right or center bottom
- **Logo:** Top left or center top

### Images:

- **Format:** PNG with transparency
- **Resolution:** 300 DPI minimum
- **File size:** < 1MB per image
- **Signatures:** 200-400px width recommended

## 🚀 Performance Tips

1. **Template Optimization:**

   - Keep element count reasonable (< 50 elements)
   - Optimize images before upload
   - Use web-safe fonts for faster rendering

2. **Batch Generation:**

   - Test with small CSV first (5-10 rows)
   - Large batches (100+) may take time
   - Browser may show "Page Unresponsive" - wait for completion

3. **File Management:**
   - Download PDFs promptly
   - Clear browser cache after large batches
   - Use compression for bulk downloads

## 🐛 Troubleshooting

### "Bring to Front/Back not working"

✅ **FIXED** - Now uses correct Fabric.js API

### "Tools hidden behind canvas"

✅ **FIXED** - Z-index properly set

### "CSV fields not replacing"

- Check field name matches CSV column header exactly (case-sensitive)
- Ensure "Dynamic Field" is filled in for that text element
- Verify CSV is properly formatted (commas, no extra quotes)

### "Image upload not working"

- Check file format (PNG, JPG, SVG supported)
- Verify file size < 5MB
- Ensure browser allows file access

### "Generated PDF looks different"

- jsPDF uses different rendering than canvas
- Test with small batch first
- Adjust positions if needed
- Font rendering may vary slightly

## 📚 Next Steps

1. **Test the design:**

   - Create a simple certificate
   - Add dynamic fields
   - Test with sample CSV (2-3 rows)

2. **Refine template:**

   - Adjust typography
   - Add decorative elements
   - Position signature area

3. **Prepare production CSV:**

   - Clean data (remove duplicates)
   - Verify all required columns
   - Test with subset first

4. **Generate batch:**
   - Upload full CSV
   - Generate PDFs
   - Verify quality
   - Download or upload to endpoints

## 🎉 You're Ready!

The designer now has **everything you need** for professional batch PDF certificate generation:

- ✅ Professional design tools (Canva-like)
- ✅ Dynamic field mapping
- ✅ CSV batch processing
- ✅ Digital signature support
- ✅ Fixed layer management
- ✅ Image upload capability

**Create beautiful, personalized certificates at scale!** 🚀
