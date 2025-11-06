# 🎨 NEW: Visual Drag & Drop Template Designer

## What's New

The PDF Certificate Generator now features a **completely redesigned visual template designer** with drag-and-drop functionality and basic design tools - making it much easier and more intuitive to create professional certificates!

## ✨ New Features

### 1. Visual Canvas

- **Real Certificate Preview**: See exactly how your certificate will look
- **Grid System**: Optional grid overlay for precise alignment
- **Zoom Controls**: Zoom in/out (30% - 100%) for detailed work
- **WYSIWYG**: What you see is what you get in the PDF

### 2. Drag & Drop Interface

- **Click & Drag**: Click any element and drag it to move
- **Visual Selection**: Selected elements show blue ring highlight
- **Real-time Positioning**: See changes as you move elements
- **Smart Boundaries**: Elements stay within the canvas

### 3. Design Tools Toolbar

**Text Tool** (Blue)

- Add text elements with one click
- Double-click text to edit inline
- Support for dynamic fields `{{fieldName}}`

**Image Tool** (Purple)

- Upload logos, signatures, or graphics
- Drag to position on certificate
- Resize using width/height controls

**Box Tool** (Green)

- Add rectangular shapes
- Great for borders or sections
- Customizable color and fill

**Line Tool** (Yellow)

- Add horizontal or vertical lines
- Perfect for separators or underlines
- Adjustable thickness and color

**Background Tool** (Orange)

- Upload background images
- Automatic semi-transparent overlay
- Covers entire certificate

### 4. Properties Panel

When you select an element, edit its properties:

**For Text:**

- Text content (with CSV field quick-insert buttons)
- Font size (8-72)
- Text color picker
- Bold/Italic style toggles
- Left/Center/Right alignment buttons
- Precise X, Y, Width, Height values

**For Shapes:**

- Color picker
- Border width
- Fill options
- Precise positioning

**For Images:**

- Width and height
- Position controls
- Quick delete button

### 5. Template Settings

- Template name
- Orientation (Landscape/Portrait)
- Paper size (A4/Letter)
- Background color
- Optional border with customization

## 🎯 How to Use (Quick Start)

### Step 1: Open Designer

1. Go to Dashboard → PDF Generator
2. Click "Design Template" tab
3. You'll see a white canvas (your certificate)

### Step 2: Add Elements

1. **Add Title:**

   - Click "Text" button in toolbar
   - Double-click the text on canvas
   - Type: "Certificate of Achievement"
   - Drag it to the top center

2. **Add Dynamic Name:**

   - Click "Text" again
   - Double-click to edit
   - Type: `{{name}}`
   - Drag to center of certificate

3. **Add a Line:**

   - Click "Line" button
   - Drag below the name field
   - Resize by adjusting width

4. **Add Logo:**
   - Click "Image" button
   - Select your logo file
   - Drag to desired position
   - Adjust size in properties panel

### Step 3: Customize Elements

1. **Click any element** to select it
2. **Use Properties Panel** (right side) to:

   - Change colors
   - Adjust font sizes
   - Modify alignment
   - Fine-tune position

3. **Use Style Buttons:**
   - Click **B** for bold
   - Click _I_ for italic
   - Click alignment icons

### Step 4: Fine-Tune

- Toggle **Grid** for alignment help
- Use **Zoom** for detailed work
- Click **Settings** ⚙️ to adjust template
- Click canvas background to deselect

### Step 5: Save & Generate

1. Click settings ⚙️ and name your template
2. Click "Save Template" button (top right)
3. Go to "Upload Data" tab
4. Upload your CSV
5. Go to "Generate PDFs" tab
6. Preview and download!

## 🎨 Design Tips

### Layout Tips:

1. **Use Grid**: Turn on grid for perfect alignment
2. **Center Title**: Drag title to approximate center, use alignment buttons
3. **Consistent Spacing**: Use Y coordinates in 10mm increments
4. **Margins**: Keep elements at least 20mm from edges

### Typography Tips:

1. **Title**: 28-36pt, bold, centered
2. **Recipient Name**: 24-32pt, bold, centered
3. **Body Text**: 14-18pt, regular
4. **Footer**: 10-12pt

### Color Tips:

1. **Professional**: Blue (#1e40af), Gold (#d97706), Black
2. **Modern**: Purple (#8b5cf6), Pink (#ec4899)
3. **Traditional**: Navy (#1e3a8a), Burgundy (#991b1b)
4. **Contrast**: Ensure text is readable on background

### Composition Tips:

1. **Rule of Thirds**: Position key elements 1/3 from edges
2. **White Space**: Don't overcrowd - less is more
3. **Hierarchy**: Largest = most important (name, title)
4. **Balance**: Distribute visual weight evenly

## 🖱️ Keyboard & Mouse

### Mouse Actions:

- **Click** element: Select it
- **Drag** element: Move it
- **Double-click** text: Edit text
- **Click** canvas background: Deselect all
- **Click** delete button (X): Remove element

### Quick Tips:

- Hold **Shift** while dragging: (Future: snap to grid)
- Use **Zoom** before fine-tuning positions
- Use **Grid** for perfect alignment
- **Double-click** is faster than using text box

## 📐 Canvas Dimensions

### Landscape A4 (default):

- Width: 297mm
- Height: 210mm
- Display scale: 50% (adjustable with zoom)

### Portrait A4:

- Width: 210mm
- Height: 297mm

### Coordinate System:

- Origin (0, 0) = Top-left corner
- X increases → right
- Y increases ↓ down
- All values in millimeters

## 🎯 Common Workflows

### Creating a Basic Certificate:

1. Text: "Certificate of Achievement" (Y: 40, Size: 32, Bold, Center)
2. Text: "This is to certify that" (Y: 70, Size: 16, Center)
3. Text: `{{name}}` (Y: 95, Size: 28, Bold, Center)
4. Text: "has completed {{course}}" (Y: 120, Size: 14, Center)
5. Line: Below name (Y: 108, Width: 150)
6. Settings: Add border, set background color

### Adding Branding:

1. Image: Company logo (Top-left: X: 20, Y: 20)
2. Text: Company name (Top-right)
3. Image: Signature (Bottom-right)
4. Background: Watermark or pattern

### Creating Multiple Sections:

1. Box: Header section (Y: 0, Height: 60)
2. Box: Body section (Y: 60, Height: 120)
3. Box: Footer section (Y: 180, Height: 30)
4. Add text in each section

## 🔧 Troubleshooting

**Element won't move:**

- Make sure it's selected (blue ring)
- Try clicking it again
- Check if it's at canvas boundary

**Text looks too small/large:**

- Adjust font size in properties
- Remember: canvas is scaled for display
- PDFs will show actual size

**Can't see element:**

- Check if it's behind another element
- Try adjusting X, Y coordinates
- Make sure color isn't same as background

**Drag is jerky:**

- This is normal at high zoom levels
- Use property fields for precise positioning
- Adjust zoom level for smoother experience

## 🆚 Old vs New Designer

| Feature         | Old Designer      | New Designer                |
| --------------- | ----------------- | --------------------------- |
| Interface       | Form inputs       | Visual canvas               |
| Positioning     | Number entry only | Drag & drop + numbers       |
| Preview         | None              | Real-time WYSIWYG           |
| Element types   | Text only         | Text, images, shapes, lines |
| Visual feedback | List of elements  | See elements on canvas      |
| Editing         | Sidebar only      | Double-click + sidebar      |
| Tools           | Basic             | Full toolbar with icons     |
| Alignment       | Manual            | Grid + visual alignment     |

## 🎉 Benefits

### For Beginners:

- ✅ Visual = No need to guess coordinates
- ✅ Drag & drop = Intuitive interface
- ✅ Double-click editing = Quick changes
- ✅ WYSIWYG = See what you get

### For Designers:

- ✅ Precise controls = Pixel-perfect design
- ✅ Grid system = Perfect alignment
- ✅ Zoom = Detailed work
- ✅ Properties panel = Full control

### For Power Users:

- ✅ Keyboard-friendly (future enhancement)
- ✅ Template library = Reuse designs
- ✅ Export/Import = Share with team
- ✅ Quick iteration = Fast prototyping

## 🚀 Next Steps

1. **Try it out**: Create your first certificate
2. **Experiment**: Test different layouts and colors
3. **Save templates**: Build a library of designs
4. **Share feedback**: Let us know what you think!

---

**The new drag-and-drop designer makes certificate creation 10x faster and more intuitive!** 🎨✨
