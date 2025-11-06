# 🎓 Certificate Generator - Quick Start Guide

## Features

✅ **Drag-and-drop certificate designer** using Fabric.js  
✅ **Dynamic fields** for personalized certificates  
✅ **CSV batch generation** - Create hundreds of certificates at once  
✅ **Live preview** - See each recipient's certificate before generating  
✅ **Professional styling** - Fonts, colors, shapes, images, signatures  
✅ **Export/Import templates** - Save and reuse your designs

---

## 🚀 Getting Started

### 1. Access the Designer

- Navigate to: **Design Tab** or **Designer Comparison** page
- Click **"Fabric.js"** designer (marked with "NEW" badge)

### 2. Design Your Certificate Template

#### Add Static Elements (Same for Everyone)

```
1. Click "Add Text" button (T icon)
2. Type your text (e.g., "Certificate of Achievement")
3. Style it using properties panel on the right:
   - Font family, size, weight
   - Colors, alignment
   - Bold, italic options
```

#### Add Dynamic Elements (Personalized per Recipient)

```
1. Click "Add Text" button
2. Type placeholder text (e.g., "{{name}}" or "Recipient Name")
3. Select the text on canvas
4. In properties panel → Find "Dynamic Field (CSV)" section
5. Enter CSV column name (e.g., "name")
6. You'll see: "✓ Will be replaced with CSV data"
```

### 3. Upload Your Recipients CSV

#### Prepare Your CSV

Create a CSV file with headers matching your dynamic fields:

```csv
name,email,course,date,grade
John Doe,john@example.com,Web Development,Oct 17 2025,A+
Jane Smith,jane@example.com,Data Science,Oct 17 2025,A
```

**Sample file included**: `sample-recipients.csv`

#### Upload Steps

```
1. Click orange CSV button (FileText icon) in toolbar
2. Select your CSV file
3. Preview modal shows all data
4. Click "Proceed" or "Generate All PDFs"
```

### 4. Preview & Generate

#### Preview Individual Certificates

```
1. After CSV upload, Recipients List appears on right
2. Click any recipient's name
3. See their personalized certificate
4. Click "Exit Preview" to return to editing
```

#### Generate PDFs

```
Option 1: Single PDF
- Preview a recipient
- Click "Generate This PDF"
- Downloads: certificate_John_Doe.pdf

Option 2: Batch PDFs
- Click "Generate All 10 PDFs" button
- Downloads all certificates with recipient names
```

---

## 📋 Example Certificate Setup

### Sample Template Structure

**Title** (Static)

- Text: "Certificate of Achievement"
- Font: Georgia, 36px, Bold
- Color: #1e40af (blue)
- Position: Top center

**Subtitle** (Static)

- Text: "This certificate is awarded to"
- Font: Arial, 18px, Normal
- Color: #000000 (black)

**Recipient Name** (Dynamic)

- Text: "{{name}}"
- Dynamic Field: `name`
- Font: Times New Roman, 28px, Bold
- Color: #000000

**Course** (Dynamic)

- Text: "For successful completion of {{course}}"
- Dynamic Field: `course`
- Font: Arial, 16px, Italic

**Date** (Dynamic)

- Text: "Date: {{date}}"
- Dynamic Field: `date`
- Font: Arial, 14px

---

## 🎨 Designer Controls

### Toolbar (Left Side)

| Icon              | Function                                          |
| ----------------- | ------------------------------------------------- |
| **T**             | Add Text                                          |
| **□**             | Add Rectangle/Border                              |
| **–**             | Add Line                                          |
| **↑**             | Upload Image/Signature                            |
| **📄**            | Upload CSV Data                                   |
| **📄 with badge** | Toggle Recipients List (appears after CSV upload) |
| **🗑️**            | Delete Selected                                   |
| **📋**            | Copy Selected                                     |
| **⬆️**            | Bring to Front                                    |
| **⬇️**            | Send to Back                                      |

### Properties Panel (Right Side)

When you select an element:

- **Font Family** - Choose from 10+ fonts
- **Font Size** - 8-120px slider
- **Bold/Italic** - Toggle buttons
- **Alignment** - Left/Center/Right
- **Color** - Color picker + hex input
- **Dynamic Field** - Link to CSV column (text only)

### Canvas Shortcuts

- **Double-click** text to edit
- **Drag** to move elements
- **Corner handles** to resize
- **Rotation handle** to rotate
- **Click outside** to deselect

---

## 📁 File Management

### Save Template

```
1. Click "Save Template" in top bar
2. Enter template name
3. Saved locally in browser
4. Access from "Template Library"
```

### Export Template

```
1. Click "Export" button
2. Downloads JSON file
3. Share with team or backup
```

### Import Template

```
1. Click "Import" button
2. Select JSON file
3. Template loads instantly
```

---

## ⚠️ Troubleshooting

### ❌ "Dynamic fields show {{name}} in PDF"

**Fix**:

1. Select the text element
2. Properties panel → Dynamic Field (CSV)
3. Type the column name (e.g., `name`)
4. Must match CSV header exactly (case-sensitive)

### ❌ "PDFs not downloading"

**Fix**:

1. Check browser console (F12)
2. Allow pop-ups if blocked
3. Ensure CSV has valid data
4. Try with sample-recipients.csv first

### ❌ "Wrong data appears"

**Fix**:

- CSV column names must match dynamic field names
- Check for typos: `Name` ≠ `name`
- Remove extra spaces in headers

### ❌ "Preview mode stuck"

**Fix**:

- Click "Exit Preview" button (blue banner at top)
- Refresh page if button not responding

---

## 📝 Best Practices

### 1. Design Workflow

```
✅ Create static layout first (titles, borders, logos)
✅ Add placeholder text for dynamic fields
✅ Style everything completely
✅ Then link dynamic fields
✅ Finally upload CSV and test
```

### 2. CSV Tips

```
✅ Use clear, lowercase column names: name, email, date
✅ No special characters in headers
✅ Test with 2-3 rows first
✅ Keep a template CSV for future use
```

### 3. Dynamic Field Naming

```
✅ Consistent across projects:
   - name (not Name or NAME)
   - email (not Email or e-mail)
   - course (not Course or courseName)
✅ Document your standard field names
```

### 4. Testing

```
✅ Always preview 2-3 recipients before batch
✅ Check long names don't overflow
✅ Verify all dynamic fields populate
✅ Test with edge cases (special characters, long text)
```

---

## 🎯 Common Use Cases

### 1. **Course Certificates**

CSV columns: `name`, `course`, `date`, `instructor`, `grade`

### 2. **Event Participation**

CSV columns: `name`, `event`, `date`, `role`, `organization`

### 3. **Employee Recognition**

CSV columns: `name`, `department`, `achievement`, `date`, `manager`

### 4. **Training Completion**

CSV columns: `name`, `training_program`, `completion_date`, `hours`, `certificate_id`

---

## 📚 Additional Resources

- **Detailed Guide**: See `DYNAMIC_FIELDS_GUIDE.md`
- **Batch Features**: See `FABRIC_BATCH_FEATURES.md`
- **Sample Data**: Use `sample-recipients.csv` for testing

---

## 💡 Pro Tips

1. **Fonts**: Use web-safe fonts (Arial, Times New Roman, Georgia) for best compatibility
2. **Colors**: Use hex codes for precise color matching
3. **Layout**: Design at 100% zoom, then scale for printing
4. **Images**: Upload signatures/logos in PNG format for transparency
5. **Backup**: Export your template after every major edit

---

## 🐛 Known Issues

- Downloading many PDFs at once may trigger browser pop-up blocker
- Large images may slow down the designer
- Very long text may need manual line breaks

---

## 🎉 You're Ready!

1. Open **Designer Comparison** page
2. Click **Fabric.js** designer
3. Upload `sample-recipients.csv`
4. Create your first batch of certificates!

Need help? Check `DYNAMIC_FIELDS_GUIDE.md` for detailed troubleshooting.
