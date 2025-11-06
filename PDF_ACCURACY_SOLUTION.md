# PDF Accuracy Solution

## Root Cause Analysis

The "design vs PDF" mismatch is caused by **THREE fundamental issues**:

### Issue 1: Font Rendering Differences

- **Canvas**: Uses browser fonts (Georgia, Arial, Times New Roman, etc.)
- **PDF**: jsPDF only supports 3 fonts (helvetica, times, courier)
- **Result**: Same text at same font size takes up different widths

### Issue 2: Baseline Calculation

- **Fabric.js**: Positions text from the TOP of the text box
- **jsPDF**: Positions text from the BASELINE (bottom of letters like 'x', not 'g')
- **Current fix**: Using `fontSize * 0.35` but this varies by font

### Issue 3: Text Metrics

- **Fabric.js**: Uses browser's text rendering engine
- **jsPDF**: Uses its own text measurement system
- **Result**: getTextWidth() in jsPDF doesn't match Fabric.js text width

## Solution Options

### Option A: Force Exact Font Matching (RECOMMENDED)

Make Fabric.js use ONLY the fonts that jsPDF supports:

- Helvetica (instead of Arial)
- Times (instead of Georgia, Times New Roman)
- Courier

**Pros**: Perfect 1:1 matching
**Cons**: Limited font choices

### Option B: Render Canvas as Image

Convert the entire Fabric.js canvas to an image and embed in PDF

**Pros**: 100% accurate, pixel-perfect
**Cons**: Text not selectable in PDF, larger file size

### Option C: Better Baseline Calculation

Calculate baseline offset based on actual font metrics

**Pros**: More accurate positioning
**Cons**: Still won't be perfect due to font differences

## Implementation

### Quick Fix (Option C - Improved Baseline)

I'll adjust the Y positioning to be more accurate based on empirical testing.

### Best Fix (Option A - Font Matching)

Limit the designer to use only:

1. **Helvetica** - for sans-serif text (currently Arial)
2. **Times** - for serif text (currently Georgia, Times New Roman)
3. **Courier** - for monospace text

This ensures what you see in the canvas is EXACTLY what you get in the PDF.

## Which solution do you prefer?

1. **Limited fonts but perfect matching** (Option A)
2. **All fonts but render as image** (Option B)
3. **Keep improving calculations** (Option C)

Let me know and I'll implement it immediately!
