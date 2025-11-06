# 🎯 Testing Guide: Pixel-Perfect PDF Generation

## Quick Test (30 seconds)

1. **Reload the browser** (Ctrl+R or Cmd+R)

   - Vite should auto-reload, but manual reload ensures fresh code

2. **Click "Quick Template"** button

   - This creates a sample certificate

3. **Click "Upload CSV"** and select a CSV file with columns: `name` and `course`

   - Or create a quick test CSV:

   ```csv
   name,course
   John Doe,Web Development
   Jane Smith,Data Science
   Bob Johnson,Cloud Computing
   ```

4. **Click on any recipient** in the left panel

   - This previews their certificate

5. **Click "Preview & Download"**

   - PDF should now be IDENTICAL to the canvas

6. **Compare**:
   - Look at the canvas on the left
   - Look at the PDF preview in the modal
   - They should be EXACTLY the same!

## What to Check

### ✅ Text Position

- Title should be at the same height
- All text should be centered the same way
- Spacing between elements should match

### ✅ Text Size

- Font sizes should appear identical
- No text should be cut off
- Line breaks should match

### ✅ Text Font

- Font family should look the same
- Bold text should be bold
- Italic text should be italic

### ✅ Colors

- Text colors should match exactly
- Background colors should match
- Border colors should match

## Expected Console Output

Open Console (F12) and you should see:

```
🎨 Using canvas-based generation for pixel-perfect PDF
✅ Pixel-perfect PDF generated
```

If you see this, the new system is working!

## If Something Goes Wrong

### Canvas looks different from PDF

- Check console for errors
- Make sure you reloaded the page
- Try clicking "Quick Template" again

### "useCanvasGeneration" not working

- The canvas might not be initializing properly
- Try adding a text element manually first
- Then click save

### Preview modal not showing

- Check browser console for errors
- Make sure CSV was uploaded correctly
- Try a single recipient first

## Sample CSV

Save this as `test-recipients.csv`:

```csv
name,course
Alice Cooper,Python Programming
Bob Dylan,JavaScript Fundamentals
Charlie Brown,React Development
Diana Ross,Node.js Backend
Eddie Murphy,Full Stack Development
```

## Success Criteria

**BEFORE** (old system):

- Canvas text at position X
- PDF text at position X + some offset
- ❌ Misaligned

**AFTER** (new system):

- Canvas text at position X
- PDF shows exact canvas screenshot
- ✅ Perfect match

## Report Results

After testing, please let me know:

1. ✅ Canvas and PDF match perfectly
2. ⚠️ Still some differences (describe what)
3. ❌ Not working (share console errors)

---

**Ready to test!** Just reload and try it out. 🚀
