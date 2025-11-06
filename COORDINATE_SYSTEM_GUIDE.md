# PDF Certificate Generator - Coordinate System Guide

## 🎯 Understanding the Coordinate System

### Canvas Dimensions

- **A4 Landscape**: 297mm × 210mm
- **A4 Portrait**: 210mm × 297mm
- **Origin Point**: Top-left corner (0, 0)
- **X-axis**: Increases from left to right
- **Y-axis**: Increases from top to bottom

### How It Works

#### 1. **Designer Canvas (Visual)**

- The canvas shows at zoom levels (30%-150%)
- Elements are positioned using **millimeters (mm)** internally
- Display scaling: `displayX = element.x * (canvasWidth / actualWidth)`
- Example at 80% zoom:
  - Canvas displays at ~475px × 336px (for 297mm × 210mm)
  - Element at x=100mm displays at ~160px from left

#### 2. **PDF Generation (Output)**

- jsPDF uses **millimeters (mm)** directly
- Element positions map 1:1 from designer to PDF
- x=100, y=50 in designer → x=100mm, y=50mm in PDF

### Position Properties Panel

All values shown are in **millimeters (mm)**:

- **X (mm)**: Horizontal position from left edge
- **Y (mm)**: Vertical position from top edge
- **W (mm)**: Width of element
- **H (mm)**: Height of element

### Common Positions Reference

| Position      | X (mm) | Y (mm) | Description                   |
| ------------- | ------ | ------ | ----------------------------- |
| Top-left      | 20     | 20     | Default margin                |
| Center-top    | 148.5  | 20     | Horizontal center (landscape) |
| Center-center | 148.5  | 105    | Exact center (landscape)      |
| Bottom-right  | 270    | 190    | 20mm from edges               |

## 🔧 Troubleshooting Alignment Issues

### If elements appear in wrong positions in PDF:

1. **Check Element Coordinates**

   - Select element in designer
   - Verify X, Y values in properties panel
   - Ensure values are within canvas bounds:
     - Landscape: 0-297 (X), 0-210 (Y)
     - Portrait: 0-210 (X), 0-297 (Y)

2. **Text Alignment**

   - Left-aligned: Uses X position directly
   - Center-aligned: Auto-calculated, text appears centered
   - Right-aligned: Position calculated from right edge

3. **Font Size**

   - Designer displays: `fontSize * zoom * 2` (visual only)
   - PDF generates: `fontSize` (actual point size)
   - Example: fontSize=16 → 16pt in PDF (standard readable size)

4. **Element Types**
   - **Text**: Position is baseline (not top-left)
   - **Image**: Position is top-left corner
   - **Rectangle**: Position is top-left corner
   - **Line**: Position is starting point

## 🧪 Testing Alignment

### Step-by-Step Test:

1. **Create Test Elements**

   ```
   Top-left text:     X=20,  Y=20
   Center title:      X=148, Y=40 (with center alignment)
   Bottom signature:  X=20,  Y=180
   ```

2. **Add Dynamic Field**

   - Mark as "Dynamic Element"
   - Assign CSV field (e.g., "name")
   - Check green ring indicator appears

3. **Generate Preview**

   - Use first row of test_certificate_data.csv
   - Verify positions match designer
   - Check text replacement works

4. **Generate Batch**
   - Generate all 10 certificates
   - Verify consistent positioning
   - Check all CSV data appears correctly

## 📐 Coordinate Conversion Formulas

### Designer Display → PDF

```javascript
// Already in mm, no conversion needed!
pdfX = element.x;
pdfY = element.y;
```

### Mouse Event → Element Position

```javascript
// Get canvas rect and calculate relative position
const rect = canvas.getBoundingClientRect();
const scaleX = actualWidth / canvasWidth;
const scaleY = actualHeight / canvasHeight;

const elementX = (mouseX - rect.left) * scaleX;
const elementY = (mouseY - rect.top) * scaleY;
```

### Element Display Position

```javascript
// Scale from mm to pixels for display
const scaleX = canvasWidth / actualWidth;
const scaleY = canvasHeight / actualHeight;

const displayX = element.x * scaleX;
const displayY = element.y * scaleY;
```

## ✅ Best Practices

1. **Use Standard Margins**

   - Leave 15-20mm from all edges
   - Landscape safe area: 20-277mm (X), 20-190mm (Y)

2. **Font Sizes**

   - Title: 24-32pt
   - Subtitle: 16-20pt
   - Body text: 12-16pt
   - Fine print: 8-10pt

3. **Element Sizing**

   - Text width: 200-250mm for full-width content
   - Logos: 40-60mm square
   - Decorative lines: 1-2mm height

4. **Testing**
   - Always generate preview before batch
   - Test with actual CSV data
   - Check different name lengths
   - Verify special characters work

## 🐛 Known Issues & Solutions

### Issue: Elements appear shifted in PDF

**Solution**: Ensure zoom doesn't affect saved coordinates (it shouldn't - coords are in mm)

### Issue: Text too large/small

**Solution**: Adjust fontSize property (not display size). Use 12-24pt range.

### Issue: Center alignment off

**Solution**: Let PDF generator calculate center. Don't manually set X for centered text.

### Issue: Images don't appear

**Solution**: Verify image is base64 data URL. Check console for errors.

## 🎨 Quick Start Template

```javascript
{
  orientation: "landscape",
  format: "a4",
  elements: [
    {
      type: "text",
      text: "Certificate of Achievement",
      x: 148, y: 30,
      fontSize: 32,
      align: "center",
      color: "#1e40af"
    },
    {
      type: "text",
      text: "{{name}}",
      isDynamic: true,
      dataField: "name",
      x: 148, y: 90,
      fontSize: 24,
      align: "center"
    },
    {
      type: "line",
      x: 50, y: 110,
      width: 197,
      height: 2,
      color: "#000000"
    }
  ]
}
```

This template creates a certificate with:

- Centered title at top
- Centered dynamic name field
- Horizontal line separator
