# Dynamic Certificate Fields - Complete Guide

## Overview

The certificate designer now supports **dynamic fields** that automatically populate from CSV data during batch PDF generation. This allows you to create one template and generate personalized certificates for multiple recipients.

## How It Works

### 1. **Create Your Certificate Template**

- Use the Fabric.js designer (accessed from the "Design" tab in Designer Comparison page)
- Add text, shapes, images, and other elements
- Style your certificate as desired

### 2. **Make Fields Dynamic**

For any text element that should change per recipient:

1. **Select the text element** on the canvas
2. **Look for "Dynamic Field (CSV)" section** in the right properties panel (blue background)
3. **Enter the CSV column name** (e.g., `name`, `email`, `course`, `date`)
   - Column names are **case-sensitive**
   - Must match exactly with your CSV headers
4. **You'll see a confirmation** message: "✓ Will be replaced with CSV data"

### 3. **Upload CSV Data**

Click the orange **CSV upload button** (FileText icon) in the toolbar:

- CSV must have headers in the first row
- Column names should match your dynamic fields
- Example CSV:

```csv
name,email,course,date,grade
John Doe,john@example.com,Web Development,October 17 2025,A+
Jane Smith,jane@example.com,Data Science,October 17 2025,A
Michael Chen,michael@example.com,Python Programming,October 17 2025,B+
```

### 4. **Preview Recipients**

After uploading CSV:

- **Recipients panel** appears on the right (green toggle button)
- Click any recipient name to **preview their certificate**
- All dynamic fields will show actual data from that row
- **Exit Preview** to return to template editing

### 5. **Generate PDFs**

Two options:

- **Generate This PDF**: Creates one PDF for the currently previewed recipient
- **Generate All X PDFs**: Creates PDFs for all recipients in your CSV

## Example Workflow

### Step-by-Step: Creating a Certificate

1. **Add Title** (Static)

   - Click "Add Text" button
   - Type: "Certificate of Achievement"
   - Style with large font, bold, centered
   - **Don't set a dynamic field** - this stays the same for everyone

2. **Add Name Field** (Dynamic)

   - Click "Add Text" button
   - Type: "{{name}}" or any placeholder text
   - Select the text element
   - In properties panel → Dynamic Field (CSV) → Enter: `name`
   - This will show each recipient's name from the CSV

3. **Add Course Field** (Dynamic)

   - Click "Add Text" button
   - Type: "{{course}}"
   - Select it
   - Dynamic Field → Enter: `course`

4. **Add Date** (Dynamic or Static)

   - If all certificates have same date: just type it (no dynamic field)
   - If dates vary: make it dynamic with field name `date`

5. **Upload CSV**

   - Click CSV upload button
   - Select your CSV file with columns: name, course, date, etc.
   - Preview modal shows your data

6. **Test & Generate**
   - Click through recipients to preview each certificate
   - When satisfied, click "Generate All PDFs"
   - Each PDF downloads with the recipient's name in filename

## Common CSV Column Names

Recommended column names (use these for consistency):

- `name` or `fullname` - Recipient's name
- `email` - Contact email
- `course` or `program` - Course/program name
- `date` or `completion_date` - Date of completion
- `grade` or `score` - Achievement grade
- `instructor` - Instructor name
- `institution` - Organization name
- `certificate_id` - Unique identifier

## Troubleshooting

### "Dynamic fields not replacing"

✅ **Solution**: Make sure:

1. Text element has `dataField` set in properties panel
2. CSV column name **exactly matches** (case-sensitive)
3. CSV has data in that column for the recipient

### "PDF not generating"

✅ **Solution**: Check browser console for errors:

1. Right-click → Inspect → Console tab
2. Look for red error messages
3. Common issues:
   - Template not saved properly
   - CSV data missing
   - Invalid characters in CSV

### "Name shows as {{name}}"

✅ **Solution**:

1. Select the text element
2. Set Dynamic Field to `name` in properties panel
3. Make sure your CSV has a column called `name`

### "Wrong data appears"

✅ **Solution**:

- Verify CSV column names match dynamic field names
- Check for typos or extra spaces in column headers
- Column names are case-sensitive: `Name` ≠ `name`

## Technical Details

### How Dynamic Fields Are Stored

When you set a dynamic field:

- Text element gets `isDynamic: true` property
- Text element gets `dataField: "columnname"` property
- During PDF generation, `{{name}}` is replaced with actual CSV value
- Original template text is preserved

### Preview Mode

- Click recipient → enters preview mode
- Dynamic fields temporarily show real data
- "Exit Preview" restores template placeholders
- Original text stored in `obj.originalText`

### Batch Generation

- Loops through all CSV rows
- Creates one PDF per row
- Replaces dynamic fields with row data
- Downloads as separate files with recipient name

## Tips for Best Results

1. **Design First, Add Data Later**

   - Create complete template design
   - Then link dynamic fields
   - Finally upload CSV

2. **Use Placeholder Text**

   - Type `{{name}}` or "Sample Name" as placeholders
   - Makes it easy to see where dynamic data will appear
   - Don't leave fields completely empty

3. **Test with Small CSV**

   - Start with 2-3 recipients
   - Verify everything works
   - Then upload full list

4. **Consistent Naming**

   - Use same column names across projects
   - Create CSV template you can reuse
   - Document your field names

5. **Preview Before Batch**
   - Always preview 2-3 different recipients
   - Check edge cases (long names, special characters)
   - Adjust font sizes if needed

## Example Templates

### Basic Certificate

```
Title: "Certificate of Completion" (static)
Subtitle: "This is to certify that" (static)
Name: {{name}} (dynamic: name)
Text: "has successfully completed" (static)
Course: {{course}} (dynamic: course)
Date: {{date}} (dynamic: date)
```

### Advanced Certificate

```
Header: "{{institution}} Certificate" (dynamic: institution)
Recipient: "Awarded to {{fullname}}" (dynamic: fullname)
Achievement: "For excellence in {{course}}" (dynamic: course)
Score: "With a grade of {{grade}}" (dynamic: grade)
Date: "Issued on {{date}}" (dynamic: date)
ID: "Certificate ID: {{certificate_id}}" (dynamic: certificate_id)
Instructor: "Signed by {{instructor}}" (dynamic: instructor)
```

## Support

If you encounter issues:

1. Check this guide first
2. Verify CSV format matches examples
3. Test with sample data
4. Check browser console for errors
5. Ensure all dynamic fields have matching CSV columns
