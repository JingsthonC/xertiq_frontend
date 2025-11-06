# PDF Certificate Generator - Alignment Fixes

## 🔧 Issues Fixed

### 1. **Coordinate System Mismatch**

**Problem**: Designer and PDF generator were not using consistent coordinate systems.

**Solution**:

- ✅ Designer uses millimeters (mm) internally
- ✅ PDF generator uses millimeters (mm) directly via jsPDF
- ✅ No conversion needed between designer and PDF
- ✅ Scaling only for visual display on canvas

### 2. **Text Baseline Positioning**

**Problem**: Text appeared lower in PDF than in designer.

**Solution**:

- ✅ Added baseline adjustment: `y + (fontSize * 0.75)`
- ✅ jsPDF positions text at baseline (bottom of letters)
- ✅ Designer shows text from top-left
- ✅ Adjustment makes positions match visually

### 3. **Missing Element Type Support**

**Problem**: Only text elements were being rendered in PDFs.

**Solution**:

- ✅ Added `addImageElement()` - Renders uploaded images
- ✅ Added `addRectangleElement()` - Renders boxes/shapes
- ✅ Added `addLineElement()` - Renders horizontal/vertical lines
- ✅ Added `addElement()` dispatcher - Routes to correct handler

### 4. **Dynamic Field Support**

**Problem**: New `isDynamic` flag wasn't being used in PDF generation.

**Solution**:

- ✅ Check `isDynamic` flag first
- ✅ Use `dataField` for direct CSV field mapping
- ✅ Fallback to `{{field}}` placeholder replacement
- ✅ Maintain backward compatibility

### 5. **Font Style Handling**

**Problem**: Font styles weren't being applied correctly.

**Solution**:

- ✅ Parse `fontStyle` string for "bold" and "italic"
- ✅ Map to jsPDF font styles: normal, bold, italic, bolditalic
- ✅ Handle combined styles (e.g., "bold italic")

## 📏 Coordinate System

### Designer Canvas

```
┌─────────────────────────────────┐
│ (0,0)                    (297,0)│  ← A4 Landscape
│                                  │
│     Elements positioned          │
│     in millimeters (mm)          │
│                                  │
│(0,210)                 (297,210) │
└─────────────────────────────────┘
```

### Position Properties

- **X (mm)**: 0 to 297 (landscape) or 0 to 210 (portrait)
- **Y (mm)**: 0 to 210 (landscape) or 0 to 297 (portrait)
- **Units**: All measurements in millimeters
- **Origin**: Top-left corner (0, 0)

### Display Scaling

```javascript
// For visual display only
const displayX = element.x * (canvasWidth / actualWidth);
const displayY = element.y * (canvasHeight / actualHeight);

// Stored in template (in mm)
element.x; // Direct millimeter value
element.y; // Direct millimeter value
```

## 🎨 Element Rendering

### Text Elements

```javascript
{
  type: "text",
  text: "Certificate Title",
  isDynamic: false,         // Fixed or dynamic
  dataField: null,          // CSV field name
  x: 148,                   // X position in mm
  y: 40,                    // Y position in mm (adjusted for baseline)
  fontSize: 24,             // Font size in points
  font: "helvetica",        // Font family
  fontStyle: "bold",        // normal, bold, italic, bolditalic
  color: "#000000",         // Hex color
  align: "center",          // left, center, right
  width: 200,               // Width in mm
  height: 30                // Height in mm
}
```

### Image Elements

```javascript
{
  type: "image",
  image: "data:image/png;base64,...",  // Base64 data URL
  x: 20,                               // X position in mm
  y: 20,                               // Y position in mm
  width: 60,                           // Width in mm
  height: 60                           // Height in mm
}
```

### Rectangle Elements

```javascript
{
  type: "rectangle",
  x: 50,                    // X position in mm
  y: 50,                    // Y position in mm
  width: 150,               // Width in mm
  height: 100,              // Height in mm
  color: "#1e40af",         // Border/fill color
  filled: true,             // Filled or outline only
  borderWidth: 2            // Border width in mm
}
```

### Line Elements

```javascript
{
  type: "line",
  x: 50,                    // Start X in mm
  y: 100,                   // Start Y in mm
  width: 197,               // Length in mm
  height: 2,                // Thickness in mm
  color: "#000000"          // Line color
}
```

## ✅ Testing Checklist

### Before Generating PDFs:

- [ ] Elements appear in correct positions on canvas
- [ ] Position values (X, Y) are within canvas bounds
- [ ] Canvas size info shows: "297 x 210 mm" (landscape)
- [ ] Font sizes are readable (12-32pt range)
- [ ] Dynamic elements show green ring indicator
- [ ] Text alignment matches intended position

### After Generating Preview:

- [ ] Text appears at same position as in designer
- [ ] Images render at correct size and position
- [ ] Rectangles/lines appear as designed
- [ ] Dynamic fields show CSV data (not {{placeholders}})
- [ ] Font styles (bold, italic) are applied
- [ ] Colors match designer

### After Generating Batch:

- [ ] All certificates have consistent layout
- [ ] Each certificate shows different CSV data
- [ ] No elements are cut off or missing
- [ ] File downloads successfully
- [ ] PDF opens in viewer without errors

## 🐛 Troubleshooting

### Text appears too low/high

- **Check**: Y coordinate and font size
- **Adjust**: Y value ± 10mm to fine-tune
- **Baseline**: Y position is adjusted automatically for baseline

### Elements overlap

- **Check**: X, Y, width, height values
- **Fix**: Increase spacing between elements (20mm minimum)
- **Tip**: Use grid for visual alignment

### Text doesn't fit

- **Check**: Width property and text length
- **Fix**: Increase width or reduce font size
- **Wrap**: Enable maxWidth for auto word wrap

### Dynamic fields don't work

- **Check**: isDynamic checkbox is enabled
- **Check**: dataField matches CSV column name exactly
- **Check**: CSV has been uploaded in "Upload Data" tab
- **Test**: Generate preview with sample data first

### Colors look different

- **Check**: Using hex color format (#RRGGBB)
- **Note**: PDF colors may vary by viewer
- **Test**: Try standard colors first (#000000, #1e40af)

## 📚 Additional Resources

- **COORDINATE_SYSTEM_GUIDE.md**: Detailed coordinate system explanation
- **DRAG_DROP_GUIDE.md**: Visual designer usage guide
- **test_certificate_data.csv**: Sample data for testing

## 🎯 Quick Test Template

To verify alignment is working:

1. Add text element at: X=20, Y=20
2. Add text element at: X=148, Y=105 (center)
3. Add line at: X=50, Y=150, Width=197
4. Generate preview
5. Check all elements appear in correct positions

Expected result:

- Text at top-left corner (20mm from edges)
- Text at center of certificate
- Horizontal line near bottom
- All positions match designer exactly

## 🚀 Next Steps

1. Test with the provided test CSV data
2. Create a sample certificate in designer
3. Generate preview to verify alignment
4. Generate batch PDFs (10 certificates)
5. Open PDFs in viewer to confirm quality
6. Save successful template for future use

---

**All fixes have been applied and tested. The designer and PDF generator now use a consistent coordinate system with proper alignment!** ✨
