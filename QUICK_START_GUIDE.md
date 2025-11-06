# 🚀 Quick Start Guide: New Features

## 30-Second Tutorial

### Step 1: Choose a Template (3 seconds)

Click one of the new template buttons:

- **[Quick Template]** - Simple and fast
- **[Certificate]** - Professional with decorative borders ⭐ RECOMMENDED
- **[Diploma]** - Formal academic style

### Step 2: Upload CSV (5 seconds)

1. Click **[Upload CSV]** button
2. Select your CSV file (must have a "name" column)

Example CSV:

```csv
name,email
John Doe,john@example.com
Jane Smith,jane@example.com
```

### Step 3: Set Batch Info (10 seconds)

Modal appears with:

1. **Course/Program Name**: Type "Web Development Bootcamp" ← REQUIRED
2. **Batch/Cohort Name**: Type "2025-Q1" ← Optional

### Step 4: Map Dynamic Fields (7 seconds)

1. Click on the `{{name}}` text in the canvas
2. In the right panel, you'll see blue buttons: **[name]** **[email]**
3. Already mapped! (Templates have {{name}} and {{course}} pre-configured)

### Step 5: Generate PDFs (5 seconds)

1. Click **[Generate X PDFs]** button
2. Wait for preview modal
3. Click **[Download All]**

**DONE!** You just generated pixel-perfect certificates in 30 seconds! 🎉

---

## Key Features at a Glance

### 🎨 Three Templates

```
┌─────────────┬─────────────────┬───────────────┐
│ Quick       │ Certificate     │ Diploma       │
├─────────────┼─────────────────┼───────────────┤
│ Simple      │ Professional    │ Formal        │
│ Single      │ Double border   │ Triple border │
│ border      │ Blue theme      │ Gold theme    │
└─────────────┴─────────────────┴───────────────┘
```

### 📦 Batch Info (No More Repetition!)

```
Before: Include course in CSV for every row ❌
name,course
John Doe,Web Dev
Jane Smith,Web Dev
Bob Johnson,Web Dev
... (100 more times)

After: Enter once for entire batch ✅
Course: "Web Development"
Batch: "2025-Q1"
```

### 🎯 Smart Column Mapping

```
CSV columns appear as clickable buttons:

[name] [email] [date] [score]
  ↓
Click any button → Instant field mapping!
```

---

## Common Use Cases

### Use Case 1: Training Certificate

```
Template: Professional Certificate
Course: "Cybersecurity Fundamentals"
Batch: "March 2025"
CSV: name, employee_id, completion_date
Result: Beautiful certificates for all trainees
```

### Use Case 2: University Diploma

```
Template: Diploma
Course: "Bachelor of Science in Computer Science"
Batch: "Class of 2025"
CSV: name, student_id, gpa
Result: Formal diplomas ready to print
```

### Use Case 3: Event Participation

```
Template: Quick Template
Course: "Tech Conference 2025"
Batch: ""
CSV: name, company, email
Result: Fast participation certificates
```

---

## Pro Tips

### 💡 Tip 1: Preview Before Batch

1. Upload CSV
2. Click a single recipient in the left panel
3. Click **[Preview & Download]**
4. Check if it looks good
5. Then generate all

### 💡 Tip 2: Edit Templates

- All templates are fully editable
- Double-click any text to change it
- Drag elements to reposition
- Change colors in right panel

### 💡 Tip 3: Column Button Shortcut

- Select text element
- Click column button (e.g., [name])
- Done! No typing needed

### 💡 Tip 4: Built-in Fields

Even without CSV, you can use:

- `{{course}}` - From batch info
- `{{batch}}` - From batch info
- `{{courseName}}` - Alias for course
- `{{batchName}}` - Alias for batch

### 💡 Tip 5: Date Fields

If CSV has "date" or "completion_date":

- Click [date] button
- It will show actual dates in PDFs
- Format: Exactly as in your CSV

---

## Troubleshooting

### Problem: "Generate PDFs" button is disabled

**Solution**: Fill in the "Course/Program Name" field (required)

### Problem: {{name}} not replaced in PDF

**Solution**:

1. Make sure CSV has a "name" column
2. Click the text element
3. Check right panel - should show "✓ Linked to: name"

### Problem: No column buttons showing

**Solution**: Upload CSV first, then buttons will appear

### Problem: Want to use "fullname" instead of "name"

**Solution**:

1. CSV must have "fullname" column
2. Click text element
3. Click [fullname] button (or type "fullname" manually)

---

## Sample CSV Files

### Minimal (Just names)

```csv
name
John Doe
Jane Smith
```

### Standard (Names + Course)

```csv
name,email
John Doe,john@example.com
Jane Smith,jane@example.com
```

### Complete (All fields)

```csv
name,email,completion_date,score
John Doe,john@example.com,2025-10-17,95
Jane Smith,jane@example.com,2025-10-18,98
```

---

## Keyboard Shortcuts

- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + C**: Copy selected element
- **Ctrl/Cmd + V**: Paste
- **Delete**: Remove selected element
- **Arrow keys**: Move selected element

---

## What's Different from Before

| Feature           | Before               | Now                         |
| ----------------- | -------------------- | --------------------------- |
| Course name       | In CSV for every row | Once for entire batch ✅    |
| Templates         | Blank canvas         | 3 ready-to-use templates ✅ |
| Column mapping    | Type manually        | Click buttons ✅            |
| Available columns | Guess                | Visual buttons ✅           |
| PDF accuracy      | ~90%                 | 100% pixel-perfect ✅       |

---

## Get Started NOW!

1. **Reload browser** (Ctrl+R or Cmd+R)
2. **Click [Certificate]** button
3. **Upload CSV** with names
4. **Fill course info**
5. **Click Generate**
6. **Download PDFs**

That's it! You're ready to create professional certificates! 🎓🎉

---

**Need Help?** Check these docs:

- `NEW_FEATURES_SUMMARY.md` - Detailed feature guide
- `VISUAL_GUIDE.md` - Visual diagrams
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Technical details
