# PDF Generation Fix - Text Alignment Issue

## Problem Identified

From your screenshot, the generated PDF had two issues:

1. **Text was cut off on the left side** - Only partial text visible ("evement", "warded to", "ia")
2. **Text was not centered** - Template created centered text, but PDF rendered it left-aligned

## Root Causes

### Issue 1: Text Alignment Not Saved

**File**: `FabricDesignerV2.jsx` (Line 221)

```javascript
// BEFORE (Wrong):
align: "left",  // ❌ Hardcoded - ignored actual Fabric.js textAlign

// AFTER (Fixed):
align: obj.textAlign || "left",  // ✅ Uses actual alignment from canvas
```

### Issue 2: PDF Generator Not Using jsPDF Alignment API

**File**: `pdfGenerator.js` (Lines 145-165)

```javascript
// BEFORE (Wrong):
pdf.text(text, x, y); // ❌ No alignment option passed

// AFTER (Fixed):
pdf.text(text, x, y, { align: element.align || "left" }); // ✅ Uses jsPDF's built-in alignment
```

Also improved center alignment logic:

```javascript
if (element.align === "center") {
  if (element.width) {
    // Use page center for text boxes
    x = pdf.internal.pageSize.width / 2;
  } else {
    // Calculate center based on text width
    const textWidth = pdf.getTextWidth(text);
    x = (pdf.internal.pageSize.width - textWidth) / 2;
  }
}
```

## Changes Made

### 1. FabricDesignerV2.jsx

✅ **Line 221**: Changed `align: "left"` to `align: obj.textAlign || "left"`

- Now correctly saves the text alignment property from Fabric.js objects
- Supports: left, center, right alignment

### 2. pdfGenerator.js

✅ **Lines 145-172**: Updated text positioning and alignment logic

- Uses jsPDF's native `align` option for proper text alignment
- Centers text at page center for center-aligned text boxes
- Properly handles left and right alignment

## Testing Instructions

### Quick Test:

1. **Open** Designer Comparison page
2. **Click** "Quick Template" button (purple button, bottom bar)
3. **Upload** `sample-recipients.csv`
4. **Preview** any recipient (click their name in right panel)
5. **Generate** "Generate This PDF"

### Expected Result:

```
✅ Title "Certificate of Achievement" - centered, visible
✅ Subtitle "This certificate is awarded to" - centered, visible
✅ Name (e.g., "John Doe") - centered, bold, visible
✅ "for successful completion of" - centered, visible
✅ Course (e.g., "Web Development") - centered, blue, visible
✅ Blue border - fully visible around certificate
```

### What Was Broken Before:

```
❌ All text appeared left-aligned
❌ Text was cut off on left side (outside page bounds)
❌ Only fragments visible ("evement" instead of "Certificate of Achievement")
```

## Technical Details

### Fabric.js Text Alignment

Fabric.js textbox objects have a `textAlign` property:

- Values: "left", "center", "right"
- Controls how text aligns within the text box
- Must be read from `obj.textAlign` property

### jsPDF Text Alignment

jsPDF's `text()` method accepts an options object:

```javascript
pdf.text(text, x, y, {
  align: "center", // or "left", "right"
});
```

- When `align: "center"`, x coordinate is the CENTER of the text
- When `align: "left"` (default), x coordinate is the LEFT edge
- When `align: "right"`, x coordinate is the RIGHT edge

### Coordinate System

- Fabric.js uses **pixels** with scale factor (CANVAS_SCALE = 2)
- jsPDF uses **millimeters** (A4 = 297mm × 210mm landscape)
- Conversion: `mmPosition = pixelPosition / CANVAS_SCALE`

## Verification Checklist

Before testing, verify these files are updated:

- [ ] `src/components/FabricDesignerV2.jsx`
  - Line 221: `align: obj.textAlign || "left"`
- [ ] `src/services/pdfGenerator.js`
  - Line 153-156: Center alignment logic using page width
  - Line 165-169: `pdf.text()` calls include `{ align: element.align || "left" }`

## Additional Improvements

### Also Fixed:

✅ **Image elements** - Now properly saved to template (added image type support in saveCanvasState)
✅ **Dynamic fields** - `isDynamic` and `dataField` now saved correctly
✅ **Font styles** - Bold and italic properly converted to jsPDF font style

### Future Enhancements:

- Add support for text rotation in PDFs
- Add support for background images
- Add support for custom fonts
- Add multi-line text wrapping with proper alignment

## Summary

**Before**: PDF showed cut-off, left-aligned text because:

1. Text alignment wasn't saved from Fabric.js canvas
2. PDF generator didn't use jsPDF's alignment API

**After**: PDF now shows properly centered, fully visible text because:

1. ✅ Text alignment correctly saved from `obj.textAlign`
2. ✅ PDF generator uses jsPDF's `{ align: "center" }` option
3. ✅ Center position calculated as page center (148.5mm for A4 landscape)

**Result**: Professional-looking certificates with properly aligned text! 🎉
