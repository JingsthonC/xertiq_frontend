# PDF Positioning Debugging Guide

## Current Issue

Canvas and PDF are still showing text in different positions, even after fixes.

## Debugging Steps

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Quick Template" button
4. Look for these log messages:

```
Quick Template Created:
Canvas width: 594 Canvas height: 420
CANVAS_SCALE: 2
A4_WIDTH: 297 A4_HEIGHT: 210

Saved centered text elements: [
  {
    text: "Certificate of Achievement",
    x: ?,      ← Should be ~148.5 (center of 297mm)
    y: ?,
    align: "center",
    fontSize: ?,
    font: ?
  }
]
```

### Step 2: Generate PDF and Check Console Again

1. Upload sample-recipients.csv
2. Click a recipient
3. Click "Preview & Download"
4. Check console for PDF rendering logs:

```
Rendering centered text: {
  text: "Certificate of Achievement",
  element.x: ?,        ← Should match saved x above
  calculated x: ?,     ← Should also be ~148.5
  calculated y: ?,
  pageWidth: 297,      ← A4 landscape width
  pageHeight: 210      ← A4 landscape height
}
```

### Step 3: Compare Values

**What to check**:

1. `element.x` should be approximately **148.5** (center of 297mm page)
2. `pageWidth` should be **297**
3. `pageHeight` should be **210**
4. For title at top, `y` should be around **30-35**

**If values are wrong**:

#### If `element.x` is NOT ~148.5:

- Problem: Canvas state not saving center position correctly
- Check: FabricDesignerV2.jsx saveCanvasState function
- Expected calculation: `left + (width / 2)`

#### If `pageWidth` is NOT 297:

- Problem: PDF orientation or format wrong
- Check: Template orientation setting
- Should be: `orientation: "landscape", format: "a4"`

#### If text appears at wrong X position in PDF:

- Problem: jsPDF alignment not working
- Try: Remove `{ align: "center" }` and manually calculate

## Manual Fix Test

If the issue persists, try this manual positioning test:

### Test Code for pdfGenerator.js

Replace the text rendering section with this:

```javascript
// Calculate position based on alignment
let x = element.x || 20;
const y = (element.y || 20) + (element.fontSize || 16) * 0.75;

if (element.align === "center") {
  // MANUAL CENTER: Don't use jsPDF align option, calculate ourselves
  pdf.setFont(pdfFont, fontStyle);
  const textWidth = pdf.getTextWidth(text);
  x = (pdf.internal.pageSize.width - textWidth) / 2;

  console.log("MANUAL CENTER CALC:", {
    text: text.substring(0, 20),
    textWidth: textWidth,
    pageWidth: pdf.internal.pageSize.width,
    calculatedX: x,
    originalElementX: element.x,
  });

  // Don't use align option - we calculated X ourselves
  pdf.text(text, x, y);
} else {
  // For left/right alignment, use normal logic
  pdf.text(text, x, y, { align: element.align || "left" });
}
```

## Common Issues & Solutions

### Issue 1: Text appears left-aligned, not centered

**Cause**: jsPDF `{ align: "center" }` not working
**Solution**: Calculate text width and center manually (see test code above)

### Issue 2: Text at wrong vertical position

**Cause**: Y coordinate from Fabric.js doesn't match PDF coordinate system
**Solution**: Adjust Y calculation or use different baseline offset

### Issue 3: Font looks different

**Cause**: Font family not mapping correctly
**Solution**: Check font mapping (Georgia→Times, Arial→Helvetica)

### Issue 4: Text size different

**Cause**: Font size not matching between Fabric.js and jsPDF
**Solution**: Verify fontSize values in console logs match

## Expected Console Output

When everything is working correctly, you should see:

```
Quick Template Created:
Canvas width: 594 Canvas height: 420
CANVAS_SCALE: 2
A4_WIDTH: 297 A4_HEIGHT: 210

Saved centered text elements: [
  {text: "Certificate of Achievement", x: 148.5, y: 30, align: "center", fontSize: 36, font: "Georgia"},
  {text: "This certificate is awarded to", x: 148.5, y: 80, align: "center", fontSize: 18, font: "Arial"},
  {text: "{{name}}", x: 148.5, y: 120, align: "center", fontSize: 28, font: "Times New Roman"}
]

Rendering centered text: {
  text: "Certificate of Achievement",
  element.x: 148.5,
  calculated x: 148.5,
  calculated y: 57,          // 30 + (36 * 0.75)
  pageWidth: 297,
  pageHeight: 210
}
```

## Quick Diagnostic

Copy and paste these into browser console after clicking "Quick Template":

```javascript
// Check canvas objects
const canvas = document.querySelector("canvas");
console.log("Canvas element:", canvas);
console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

// Check if Fabric.js is loaded
console.log("Fabric objects on canvas:", window.fabricCanvasRef);
```

## Next Steps

1. **Run the dev server**: `npm run dev`
2. **Open browser console**: F12 → Console tab
3. **Click "Quick Template"**
4. **Copy all console output** and share it
5. **Generate PDF** and copy those logs too

With the console output, I can see exactly what values are being calculated and where the mismatch is occurring.

## Temporary Workaround

If you need certificates working NOW while we debug:

1. **Don't use Quick Template**
2. **Manually add text** with "Add Text" button
3. **Position text manually** on canvas
4. **Test with one recipient** first
5. **Adjust positions** until PDF matches
6. **Then use for batch generation**

This bypasses the Quick Template issue and lets you create certificates while we fix the root cause.
