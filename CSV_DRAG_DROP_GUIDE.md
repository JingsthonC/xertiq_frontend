# CSV Field Drag-and-Drop Feature Guide

## Overview

The CSV field drag-and-drop feature allows you to quickly assign CSV data fields to text elements by simply dragging field names onto text elements on the canvas.

## New Workflow

### 1. Upload CSV File

- Click the **Upload CSV** button (green upload icon) in the toolbar
- Select your CSV file (e.g., `test_batch_certificates.csv`)
- The CSV modal will show your data
- **CSV data now persists** after closing the modal!

### 2. Visual Indicators

- **Badge on Upload Button**: Shows the number of records loaded (e.g., "10")
- **Database Icon Button**: Appears next to upload button when CSV is loaded
- Click the database icon to toggle the CSV Fields Panel

### 3. CSV Fields Panel

When CSV is loaded, a floating panel appears at the top of the canvas showing:

- Header: "CSV Fields (X records)"
- All available field names as draggable chips
- Close button (X) to hide the panel

### 4. Drag-and-Drop Assignment

1. **Drag** a field chip from the CSV Fields Panel
2. **Drop** it onto any text element on the canvas
3. The field is **automatically assigned** to that text element
4. A success message confirms: "✓ Field 'name' assigned to text element!"

### 5. Design and Preview

- Assigned fields show in the Properties Panel
- Dynamic Field checkbox is automatically checked
- Data Field shows the assigned field name
- Click "Preview Samples" to see the first 3 certificates with real data
- Click "Generate All PDFs" to create all certificates

## Features

### Persistent CSV Data

- CSV data remains loaded even after closing the modal
- Upload button shows record count badge
- Database icon button appears for quick access to fields panel

### Visual Feedback

- **Dragging**: Field chip becomes semi-transparent and scales down
- **Hover**: Field chips scale up slightly
- **Panel**: Blue border highlights the active panel
- **Drop Target**: Click text element while dragging to assign

### Field Panel Controls

- **Toggle Visibility**: Click database icon in toolbar or X button in panel
- **Positioning**: Centered at top of canvas for easy access
- **Max Width**: 2xl to accommodate many field names
- **Responsive**: Wraps fields automatically

## Example Workflow

```
1. Upload test_batch_certificates.csv
   → Panel shows: name, email, course, date, grade

2. Add text element for certificate name
   → Drag "name" field from panel
   → Click on text element
   → ✓ Assigned!

3. Add text element for course
   → Drag "course" field
   → Click on text element
   → ✓ Assigned!

4. Add text element for date
   → Drag "date" field
   → Click on text element
   → ✓ Assigned!

5. Preview → See 3 samples with real data
6. Generate All → Download 10 PDFs
```

## Technical Details

### New State Variables

- `csvFields`: Array of field names from CSV header
- `showCsvFieldsPanel`: Boolean to control panel visibility
- `draggedField`: Currently dragged field name

### New Handlers

- `handleFieldDragStart(field)`: Sets draggedField when drag starts
- `handleFieldDragEnd()`: Clears draggedField when drag ends
- `handleDropOnText(textElementId)`: Assigns field to text element

### UI Components

- **CSV Fields Panel**: Floating div with draggable field chips
- **Database Icon Button**: Toggle button in toolbar (appears when CSV loaded)
- **Badge**: Shows record count on upload button

### Drag-and-Drop Implementation

- HTML5 draggable attribute on field chips
- onDragStart/onDragEnd handlers on chips
- onClick handler on Text components to detect drop
- Auto-assigns isDynamic=true and dataField=draggedField

## Benefits

1. **Faster Workflow**: No manual typing of field names
2. **Error Prevention**: Only valid fields can be assigned
3. **Visual**: See all available fields at once
4. **Persistent**: CSV data stays loaded for entire session
5. **Intuitive**: Drag-and-drop is familiar interaction pattern

## Testing

Use the provided test CSV:

```
test_batch_certificates.csv (10 records)
Fields: name, email, course, date, grade
```

Expected behavior:

- Upload shows "10" badge on button
- Panel shows 5 draggable field chips
- Drag-drop assigns fields instantly
- Preview shows correct data substitution
- Generate creates 10 unique PDFs

## Troubleshooting

**Panel doesn't appear after upload?**

- Click the database icon button in toolbar

**Field won't assign?**

- Make sure you're clicking on a text element (not shape)
- Wait for the field chip to be fully dragged before clicking

**CSV data lost?**

- This should no longer happen - data persists!
- If it does, re-upload the CSV file

**No dynamic fields warning?**

- Assign at least one field using drag-and-drop
- Or manually check "Dynamic Field" in properties panel
