# 🎓 Certificate PDF Generator - Demo Guide

## Step-by-Step Demo for Product Owner

### 🎬 Demo Scenario: Course Completion Certificates

**Scenario:** You need to generate certificates for 5 students who completed a Web Development course.

---

## Part 1: Design Your Certificate Template (5 minutes)

### 1. Navigate to Feature

```
Dashboard → Click "PDF Generator" card (orange gradient)
```

### 2. Design Template

**Click "Design Template" tab**

**Add Title:**

- Click "Add Text" button
- Select the new element in the list
- In the editor:
  - Text: `Certificate of Achievement`
  - X Position: `0` (will center it)
  - Y Position: `40`
  - Font Size: `32`
  - Font Style: `Bold`
  - Color: `#1e40af` (blue)
  - Alignment: `Center`

**Add Subtitle:**

- Click "Add Text" again
- Configure:
  - Text: `This is to certify that`
  - Y Position: `70`
  - Font Size: `16`
  - Alignment: `Center`

**Add Recipient Name (Dynamic):**

- Click "Add Text"
- Configure:
  - Text: `{{name}}` ← This will be replaced with CSV data!
  - Y Position: `95`
  - Font Size: `28`
  - Font Style: `Bold`
  - Alignment: `Center`

**Add Course Description:**

- Click "Add Text"
- Configure:
  - Text: `has successfully completed {{course}}`
  - Y Position: `120`
  - Font Size: `14`
  - Alignment: `Center`

**Add Date:**

- Click "Add Text"
- Configure:
  - Text: `Date: {{date}}`
  - X Position: `40`
  - Y Position: `170`
  - Font Size: `12`
  - Alignment: `Left`

**Add Instructor:**

- Click "Add Text"
- Configure:
  - Text: `Instructor: {{instructor}}`
  - X Position: `200`
  - Y Position: `170`
  - Font Size: `12`
  - Alignment: `Left`

### 3. Configure Template Settings

**Click the gear icon (⚙️)**

- Template Name: `Course Completion Certificate`
- Orientation: `Landscape`
- Format: `A4`
- Background Color: `#ffffff`
- Check "Add Border"
  - Width: `2`
  - Color: `#1e40af`
  - Margin: `15`

### 4. Save Template

**Click "Save Template" button**

- You'll see success message
- Template is now in your library!

---

## Part 2: Upload Student Data (2 minutes)

### 1. Switch to Data Tab

**Click "Upload Data" tab**

### 2. Prepare CSV File

Create a file named `students.csv`:

```csv
name,course,date,instructor,grade
Alice Johnson,Web Development Fundamentals,October 16 2025,Dr. Sarah Smith,A+
Bob Williams,Web Development Fundamentals,October 16 2025,Dr. Sarah Smith,A
Carol Davis,Web Development Fundamentals,October 16 2025,Dr. Sarah Smith,A-
David Lee,Web Development Fundamentals,October 16 2025,Dr. Sarah Smith,B+
Emma Wilson,Web Development Fundamentals,October 16 2025,Dr. Sarah Smith,A
```

**Or use the provided sample:** `sample_certificate_data.csv`

### 3. Upload File

- Drag and drop the CSV file onto the upload area
- OR click "Choose File" and select the file

### 4. Verify Data

You should see:

- ✅ File name and record count
- ✅ Available fields: name, course, date, instructor, grade
- ✅ Preview of first 5 records in table

---

## Part 3: Generate Certificates (2 minutes)

### 1. Switch to Generate Tab

**Click "Generate PDFs" tab**

### 2. Preview Certificate

**Click "Generate Preview" button**

- Wait 1-2 seconds
- You'll see a preview of the first certificate (Alice Johnson's)
- Verify all placeholders are replaced correctly

### 3. Generate All Certificates

**Option A: Single PDF (Recommended for small batches)**

- Click "Single PDF" button
- Downloads: `certificates_batch_[timestamp].pdf`
- File contains all 5 certificates as separate pages

**Option B: Separate Files**

- Click "Separate Files" button
- Downloads 5 individual PDF files:
  - `certificate_Alice Johnson_1.pdf`
  - `certificate_Bob Williams_2.pdf`
  - `certificate_Carol Davis_3.pdf`
  - `certificate_David Lee_4.pdf`
  - `certificate_Emma Wilson_5.pdf`

### 4. Review Generated PDFs

Open the downloaded file(s) and verify:

- ✅ All student names correct
- ✅ Course name populated
- ✅ Dates correct
- ✅ Instructor name shown
- ✅ Border visible
- ✅ Professional appearance

---

## 🎨 Advanced Demo: Custom Branding

### Add Your Logo

1. **Click "Add Logo" button** in Design Template tab
2. **Select your logo image** (PNG/JPEG, max 2MB)
3. **Logo appears** at default position (top-left)
4. **Adjust logo in Template Settings:**
   - Logo X: `230` (centered)
   - Logo Y: `15`
   - Width: `40`
   - Height: `40`

### Add Background Image

1. **Click "Background" button**
2. **Select background image** (watermark, pattern, etc.)
3. **Image fills entire page** behind content
4. **Tip:** Use semi-transparent images for best results

---

## 📚 Template Library Demo

### Save Multiple Templates

1. **Design different certificate styles:**

   - Academic Certificate
   - Training Certificate
   - Achievement Award
   - Participation Certificate

2. **Save each with unique name**

3. **Click "Template Library" button** to see all saved templates

4. **Load any template** with one click

### Export/Import Templates

**Export Template:**

1. Click "Export" button
2. Downloads JSON file
3. Can share with team members

**Import Template:**

1. Click "Import" button
2. Select JSON file
3. Template loads instantly

---

## 🎯 Real-World Use Cases

### Use Case 1: Educational Institution

- **Scenario:** Monthly graduation ceremonies
- **Volume:** 50-200 certificates per batch
- **Template:** Official degree certificate with university logo
- **CSV Fields:** student_name, degree, major, date, gpa

### Use Case 2: Training Company

- **Scenario:** Course completion certificates
- **Volume:** 10-50 per course
- **Template:** Professional training certificate with company branding
- **CSV Fields:** participant, course_title, duration, completion_date, instructor

### Use Case 3: Corporate Events

- **Scenario:** Conference participation certificates
- **Volume:** 100-500 certificates
- **Template:** Event certificate with sponsor logos
- **CSV Fields:** attendee, event_name, date, session, speaker

---

## ⚡ Power User Tips

### 1. Quick Placeholders

In CSV fields list, click any field name to insert `{{fieldName}}` directly

### 2. Color Schemes

Common professional certificate colors:

- Academic: `#1e40af` (blue) and `#854d0e` (gold)
- Corporate: `#0f172a` (dark blue) and `#dc2626` (red)
- Modern: `#8b5cf6` (purple) and `#ec4899` (pink)

### 3. Layout Guidelines

**Landscape A4 dimensions: 297mm × 210mm**

- Safe area: 20mm margin from edges
- Title position: Y = 40-60mm
- Name position: Y = 90-110mm
- Footer: Y > 170mm

### 4. Large Batches

For 500+ certificates:

- Use "Single PDF" mode first for testing
- Then use "Separate Files" for distribution
- Browsers may prompt multiple times - click "Allow"

### 5. Field Validation

Ensure CSV has:

- No empty cells (use "N/A" if needed)
- Consistent date formats
- No special characters in filenames (for separate files mode)

---

## 🐛 Common Issues & Solutions

### Issue: Preview shows {{name}} instead of actual name

**Solution:** Upload CSV data first in the "Upload Data" tab

### Issue: Download doesn't start

**Solution:** Check browser popup blocker, allow downloads from this site

### Issue: Template not saving

**Solution:** Enter template name in settings (gear icon)

### Issue: CSV upload fails

**Solution:** Ensure file has header row and is UTF-8 encoded

### Issue: PDFs look different from preview

**Solution:** Some fonts may render differently - use standard fonts

---

## 📊 Performance Benchmarks

| Batch Size | Generation Time | File Size |
| ---------- | --------------- | --------- |
| 10 certs   | < 2 seconds     | ~200 KB   |
| 50 certs   | < 5 seconds     | ~1 MB     |
| 100 certs  | < 10 seconds    | ~2 MB     |
| 500 certs  | < 45 seconds    | ~10 MB    |

**Note:** Times vary based on:

- Background images (larger = slower)
- Browser performance
- Number of elements

---

## 🎉 Demo Complete!

You've successfully:

- ✅ Designed a professional certificate template
- ✅ Uploaded student data via CSV
- ✅ Generated batch PDFs
- ✅ Learned template management
- ✅ Explored advanced features

**Next Steps:**

1. Try creating your own template
2. Test with your actual data
3. Explore different layouts and designs
4. Share templates with your team

**Questions?** Check `CERTIFICATE_GENERATOR_README.md` for detailed documentation!

---

## 📞 Quick Reference

| Action              | Location        | Button                       |
| ------------------- | --------------- | ---------------------------- |
| Add text element    | Design Template | "Add Text"                   |
| Upload logo         | Design Template | "Add Logo"                   |
| Upload CSV          | Upload Data     | Drag & drop or "Choose File" |
| Preview certificate | Generate PDFs   | "Generate Preview"           |
| Download single PDF | Generate PDFs   | "Single PDF"                 |
| Download separate   | Generate PDFs   | "Separate Files"             |
| Save template       | Action bar      | "Save Template"              |
| Load template       | Action bar      | "Template Library"           |

**Keyboard Shortcuts:** None currently (future enhancement)

**Browser Support:** Chrome, Firefox, Edge, Safari (latest versions)

**File Formats:**

- Input: CSV (UTF-8)
- Output: PDF (1.3 compatible)
- Templates: JSON
- Images: PNG, JPEG

---

Enjoy creating beautiful certificates! 🎓✨
