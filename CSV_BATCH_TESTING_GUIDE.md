# 🎓 CSV Batch Certificate Testing Guide

## Overview

This guide walks you through testing the complete CSV batch generation workflow in the Konva Designer, including creating dynamic fields, uploading CSV data, previewing all certificates, and generating PDFs.

---

## 📋 Prerequisites

✅ Test CSV file created: `test_batch_certificates.csv`

- Contains 10 sample recipients
- Fields: name, email, course, date, grade

---

## 🧪 Complete Testing Workflow

### **Step 1: Open Konva Designer**

1. Go to `http://localhost:5173/designer-comparison`
2. Make sure **"Konva Designer"** tab is active
3. You should see a clean canvas (no elements)

---

### **Step 2: Create a Certificate Template**

#### **2.1 Add Static Title**

1. Click the **"T"** (Text) button in the toolbar
2. Select the new text element
3. In the Properties Panel (right side):
   - Change text to: `Certificate of Achievement`
   - Set Font Size: `36`
   - Change Fill Color: `#1e40af` (blue)
4. Drag it to the top center of the canvas

#### **2.2 Add Dynamic Name Field**

1. Click **"T"** button again to add another text
2. Select this new text
3. In Properties Panel:
   - Check ✅ **"Dynamic Field (from CSV)"**
   - Enter Data Field: `name`
   - Set Font Size: `28`
   - Change text to: `Recipient Name` (placeholder)
   - Change Fill Color: `#000000` (black)
4. Drag it to the center of the canvas

#### **2.3 Add Course Text (Static)**

1. Add another text element
2. Properties:
   - Text: `has successfully completed the course:`
   - Font Size: `16`
3. Position below the name field

#### **2.4 Add Dynamic Course Field**

1. Add another text element
2. Properties:
   - Check ✅ **"Dynamic Field (from CSV)"**
   - Data Field: `course`
   - Font Size: `24`
   - Fill Color: `#059669` (green)
   - Text: `Course Name` (placeholder)
3. Position below the course text

#### **2.5 Add Dynamic Date Field**

1. Add another text element
2. Properties:
   - Check ✅ **"Dynamic Field (from CSV)"**
   - Data Field: `date`
   - Font Size: `14`
   - Text: `Date` (placeholder)
3. Position at the bottom

#### **2.6 Add Dynamic Grade Field**

1. Add final text element
2. Properties:
   - Check ✅ **"Dynamic Field (from CSV)"**
   - Data Field: `grade`
   - Font Size: `20`
   - Fill Color: `#dc2626` (red)
   - Text: `Grade` (placeholder)
3. Position at bottom right

#### **2.7 Add Decorative Elements (Optional)**

- Add rectangles for borders (use Rectangle button)
- Add circles for badges (use Circle button)
- Upload logo image (use Image button)

---

### **Step 3: Upload CSV Data**

1. Click the **green "Upload" button** 🟢 (CSV icon) in the toolbar
2. Browse and select `test_batch_certificates.csv`
3. **CSV Data Modal** should appear showing:
   - ✅ "10 records loaded from CSV"
   - ✅ Available fields: name, email, course, date, grade
   - ✅ Preview of first 5 rows in a table
   - ✅ Instructions for using dynamic fields

---

### **Step 4: Verify Dynamic Fields Setup**

In the CSV modal, review:

- ✅ You should see 10 records
- ✅ Available fields match what you set: name, course, date, grade
- ✅ Table shows sample data

**Do NOT click "Generate" yet** - First verify your dynamic fields are correct!

1. Click **"Close"** on the CSV modal
2. Select each dynamic text element on canvas
3. In Properties Panel, verify:
   - ✅ "Dynamic Field (from CSV)" is checked
   - ✅ Data Field matches CSV column name exactly (case-sensitive!)

---

### **Step 5: Generate Batch Certificates**

1. Click the **green "Upload" button** again to reopen CSV modal
   - Or upload the CSV again if you closed it
2. Review the data one more time
3. Click **"Generate 10 Certificates"** button at bottom right

**What happens:**

- 📊 Processing starts (may take a few seconds)
- 🎨 For each CSV row, dynamic fields are replaced with actual data
- 📄 Each certificate is rendered and converted to PDF
- ✨ **Batch Preview Modal** opens automatically

---

### **Step 6: Preview All Certificates**

The **Batch Certificates Generated** modal shows:

#### **Header:**

- ✅ "10 certificates ready to download"
- ✅ Success message in green box

#### **Preview Grid:**

- ✅ Grid of 10 certificate previews (3 columns)
- ✅ Each card shows:
  - 📝 Recipient name (e.g., "Alice Johnson")
  - 📄 Filename (e.g., "certificate_Alice Johnson.pdf")
  - 🖼️ Thumbnail preview of the certificate
  - 📥 Individual "Download" button

#### **Verify Each Certificate:**

Scroll through and check that:

1. ✅ **Alice Johnson** - Course: Web Development, Grade: A+
2. ✅ **Bob Smith** - Course: Data Science, Grade: A
3. ✅ **Carol Williams** - Course: Machine Learning, Grade: A+
4. ✅ **David Brown** - Course: Cybersecurity, Grade: B+
5. ✅ **Emma Davis** - Course: Cloud Computing, Grade: A
6. ✅ **Frank Miller** - Course: DevOps Engineering, Grade: A-
7. ✅ **Grace Wilson** - Course: Mobile Development, Grade: A+
8. ✅ **Henry Moore** - Course: Blockchain Technology, Grade: B+
9. ✅ **Ivy Taylor** - Course: Artificial Intelligence, Grade: A
10. ✅ **Jack Anderson** - Course: Full Stack Development, Grade: A+

**Each thumbnail should show:**

- ✅ Correct name replaced in name field
- ✅ Correct course replaced in course field
- ✅ Correct date (November 9 2025)
- ✅ Correct grade in grade field

---

### **Step 7: Download Certificates**

#### **Option A: Download Individual Certificate**

1. Find a specific certificate (e.g., "Alice Johnson")
2. Click the **"Download"** button on that card
3. ✅ PDF should download: `certificate_Alice Johnson.pdf`
4. Open the PDF and verify:
   - ✅ Certificate looks correct
   - ✅ Alice Johnson's data is properly inserted
   - ✅ Layout matches your design

#### **Option B: Download All Certificates**

1. Click **"Download All (10)"** button at bottom right
2. ✅ All 10 PDFs download sequentially
3. ✅ Alert shows: "Successfully downloaded 10 certificate(s)!"
4. Check your Downloads folder - should have all 10 PDFs:
   - certificate_Alice Johnson.pdf
   - certificate_Bob Smith.pdf
   - certificate_Carol Williams.pdf
   - ... (all 10 files)

---

### **Step 8: Verify PDF Quality**

Open several downloaded PDFs and check:

- ✅ Text is crisp and readable
- ✅ Colors match your design
- ✅ Dynamic fields correctly populated
- ✅ Layout is intact (no overlapping or misalignment)
- ✅ Decorative elements (rectangles, circles, images) render correctly
- ✅ PDF size is appropriate (A4 landscape)

---

## 🎯 Expected Results

### ✅ **Success Indicators:**

1. CSV uploads successfully with all 10 records
2. Dynamic fields are recognized and highlighted
3. Batch generation completes without errors
4. All 10 certificates preview correctly
5. Each certificate has unique data from CSV
6. PDFs download successfully (individually or all at once)
7. PDF quality is high resolution and accurate

### ❌ **Common Issues & Solutions:**

| Issue                           | Solution                                                           |
| ------------------------------- | ------------------------------------------------------------------ |
| "No records loaded"             | Check CSV format - must be comma-separated, first row is headers   |
| Dynamic field shows "undefined" | Verify Data Field name matches CSV column exactly (case-sensitive) |
| Text overlaps in preview        | Adjust element positions/sizes on canvas                           |
| PDFs don't download             | Check browser popup blocker, allow downloads from localhost        |
| Preview thumbnails blank        | Wait a few seconds for rendering to complete                       |
| Only some certificates generate | Check browser console for errors                                   |

---

## 🚀 Advanced Testing

### **Test with Different CSV:**

1. Create custom CSV with different fields (e.g., company, title, signature)
2. Upload and verify all fields are detected
3. Create dynamic fields for custom columns
4. Generate and verify

### **Test Edge Cases:**

- Empty CSV (0 records)
- CSV with 1 record
- CSV with 100+ records
- CSV with long text values
- CSV with special characters (é, ñ, 中文)
- CSV with missing values

### **Test Template Saving:**

1. After creating your template, click **"Save"** button
2. Name it: "Batch Certificate Template"
3. Close browser
4. Reopen browser → Load template from library
5. Upload same CSV
6. Generate batch - should work immediately!

---

## 📊 Performance Expectations

| CSV Size     | Expected Time | Notes                     |
| ------------ | ------------- | ------------------------- |
| 10 records   | 2-5 seconds   | Should be instant         |
| 50 records   | 10-15 seconds | May see brief loading     |
| 100 records  | 20-30 seconds | Browser may slow slightly |
| 500+ records | 1-2 minutes   | Consider batch splitting  |

---

## 🎓 Testing Checklist

Copy this checklist and mark items as you test:

```
[ ] Step 1: Opened Konva Designer successfully
[ ] Step 2: Created certificate template with all elements
[ ] Step 2.1: Added static title text
[ ] Step 2.2: Added dynamic name field (name)
[ ] Step 2.3: Added static course label
[ ] Step 2.4: Added dynamic course field (course)
[ ] Step 2.5: Added dynamic date field (date)
[ ] Step 2.6: Added dynamic grade field (grade)
[ ] Step 2.7: Added decorative elements (optional)
[ ] Step 3: Uploaded test_batch_certificates.csv
[ ] Step 3: Modal showed 10 records loaded
[ ] Step 3: Available fields listed correctly
[ ] Step 4: Verified all dynamic fields have correct Data Field names
[ ] Step 5: Clicked "Generate 10 Certificates"
[ ] Step 5: No errors in console
[ ] Step 6: Batch preview modal opened
[ ] Step 6: All 10 certificates shown in grid
[ ] Step 6: Alice Johnson certificate preview correct
[ ] Step 6: Bob Smith certificate preview correct
[ ] Step 6: All other certificates preview correct
[ ] Step 7: Downloaded individual certificate successfully
[ ] Step 7: Opened PDF and verified data
[ ] Step 7: Clicked "Download All (10)"
[ ] Step 7: All 10 PDFs downloaded
[ ] Step 8: Opened multiple PDFs - all correct
[ ] Step 8: Text quality is high resolution
[ ] Step 8: Colors match design
[ ] Step 8: Layout is intact
```

---

## 🎉 Success!

If all checkboxes are marked, your CSV batch generation system is working perfectly!

### **What You've Tested:**

✅ Template creation with mixed static/dynamic fields
✅ CSV data upload and parsing
✅ Dynamic field mapping
✅ Batch PDF generation (10 certificates)
✅ Individual and bulk download
✅ PDF quality and accuracy

### **Next Steps:**

- Test with your own CSV data
- Create different certificate templates
- Save templates for reuse
- Share templates with team (when backend is implemented)

---

## 💡 Pro Tips

1. **Dynamic Field Naming:**

   - Use exact CSV column names (case-sensitive)
   - Avoid spaces in CSV headers (use underscores: first_name)

2. **Layout Design:**

   - Leave enough space for long text values
   - Use consistent font sizes
   - Test with longest expected values first

3. **Performance:**

   - For 100+ records, generate in smaller batches
   - Close unnecessary browser tabs
   - Use modern browser (Chrome/Edge recommended)

4. **Quality:**
   - Use high-res images (PNG preferred over JPG)
   - Avoid very small font sizes (< 10px)
   - Test print quality before bulk generation

---

## 🐛 Troubleshooting

### Console Errors:

Open browser DevTools (F12) → Console tab
Common errors and fixes:

**"Cannot read property 'text' of null"**

- Solution: Element ID mismatch, reload page

**"CSV parsing failed"**

- Solution: Check CSV format, ensure UTF-8 encoding

**"Maximum update depth exceeded"**

- Solution: This was fixed - refresh page if you see it

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Verify CSV format matches expected structure
3. Try with the provided test_batch_certificates.csv first
4. Create new template from scratch if loading saved template fails

**Test CSV Path:**
`/Users/jingsthoncastillo/xertiq_frontend/test_batch_certificates.csv`

---

**Happy Testing! 🚀**
