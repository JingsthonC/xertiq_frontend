# Quick Template Width Fix

## Problem

The Quick Template was creating text boxes that were too wide, causing text to be cut off on both the canvas and in the PDF.

### Root Cause

```javascript
// OLD CODE - Fixed pixel widths
titleWidth: 500 * CANVAS_SCALE; // = 500 pixels = 250mm (too wide!)
textWidth: 400 * CANVAS_SCALE; // = 400 pixels = 200mm (still too wide)
```

For A4 landscape (297mm wide):

- 250mm title leaves only 23.5mm margins on each side
- Text was getting cut off at the edges
- Blue border at 20mm was overlapping text

## Solution

Calculate widths based on usable page space:

```javascript
// NEW CODE - Percentage-based widths
const usableWidth = (A4_WIDTH - 40) * CANVAS_SCALE; // 257mm (with 20mm margins)
const titleWidth = usableWidth * 0.9; // 231mm (90% of usable)
const textWidth = usableWidth * 0.7; // 180mm (70% of usable)
```

### Visual Comparison

**Before (Too Wide)**:

```
┌───────────────────────────────────────────┐
│Certificiate of Achievement               │ ← Cut off!
│                                           │
│  This certificate is awarded to          │
│                                           │
│           {{name}}                        │
│                                           │
│    for successful completion of          │
│                                           │
│           {{course}}                      │
└───────────────────────────────────────────┘
```

**After (Perfect Fit)**:

```
┌───────────────────────────────────────────┐
│                                           │
│    Certificate of Achievement            │ ← Fully visible
│                                           │
│  This certificate is awarded to          │
│                                           │
│           {{name}}                        │
│                                           │
│    for successful completion of          │
│                                           │
│           {{course}}                      │
│                                           │
└───────────────────────────────────────────┘
```

## Technical Details

### A4 Landscape Dimensions

- Total width: 297mm
- Total height: 210mm
- Border margins: 20mm on all sides
- Usable width: 257mm (297 - 40)
- Usable height: 170mm (210 - 40)

### Canvas Scale Factor

- CANVAS_SCALE = 2 (for high quality)
- Canvas pixel width = 297mm × 2 = 594 pixels
- Canvas pixel height = 210mm × 2 = 420 pixels

### Element Widths

| Element | Old Width | New Width | New Width (mm) |
| ------- | --------- | --------- | -------------- |
| Title   | 500px     | ~514px    | ~231mm (90%)   |
| Text    | 400px     | ~360px    | ~180mm (70%)   |

### Positioning

All elements centered using:

```javascript
left: (canvasWidth - elementWidth) / 2;
```

For title (231mm wide):

- Left edge: (297 - 231) / 2 = 33mm
- Center: 33 + 231/2 = 148.5mm ✓
- Right edge: 33 + 231 = 264mm
- Margin from edge: 297 - 264 = 33mm ✓

## Files Changed

### src/components/FabricDesignerV2.jsx

**Lines 303-370**: Updated `createSampleCertificate()` function

**Changes**:

1. Added width calculations based on usable space
2. Changed title width from `500 * CANVAS_SCALE` to `usableWidth * 0.9`
3. Changed text width from `400 * CANVAS_SCALE` to `usableWidth * 0.7`
4. All text boxes now use calculated widths

## Testing

### Test Steps:

1. Open Designer Comparison page
2. Click "Quick Template" button
3. Verify on canvas:
   - ✅ "Certificate of Achievement" fully visible
   - ✅ No text cut off on left/right
   - ✅ Blue border visible around all elements
   - ✅ All text properly centered
4. Upload sample-recipients.csv
5. Click any recipient
6. Click "Preview & Download"
7. Verify in PDF:
   - ✅ Title matches canvas position
   - ✅ All text matches canvas position
   - ✅ No cut-off text
   - ✅ Professional margins

### Expected Result:

**Canvas and PDF should be IDENTICAL** - what you see is what you get!

## Benefits

1. **Professional Margins** - 20mm margins on all sides
2. **No Cut-off Text** - Everything fits within safe area
3. **Flexible Widths** - Percentage-based, adapts to content
4. **Perfect Centering** - Title at 90%, text at 70% of usable width
5. **WYSIWYG** - Canvas exactly matches PDF output

## Additional Notes

### Debug Logging Added

The code now includes console.log statements to help debug:

- Canvas dimensions and scale
- Saved element positions for centered text
- PDF text element rendering details

Check browser console (F12) to see:

```
Quick Template Created:
Canvas width: 594 Canvas height: 420
CANVAS_SCALE: 2
A4_WIDTH: 297 A4_HEIGHT: 210

Saved centered text elements: [
  { text: "Certificate of Achievement", x: 148.5, y: 30, ... }
]

PDF Text Element (centered):
{ text: "Certificate of Achievement", x: 148.5, ... }
```

### Customization

To adjust margins or widths:

```javascript
// Change margins (currently 20mm each side)
const usableWidth = (A4_WIDTH - 40) * CANVAS_SCALE; // 40 = 2×20mm

// Change title width (currently 90%)
const titleWidth = usableWidth * 0.9; // Change 0.9 to desired percentage

// Change text width (currently 70%)
const textWidth = usableWidth * 0.7; // Change 0.7 to desired percentage
```

## Summary

**Problem**: Text boxes too wide, causing cut-off text
**Solution**: Calculate widths based on usable page space with proper margins
**Result**: Professional, well-proportioned certificates with no cut-off text

**Canvas ≈ PDF**: Perfect match! 🎯
