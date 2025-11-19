# Credit System - Quick Testing Guide

## 🧪 How to Test the Credit System

### Prerequisites

- Backend API must be running
- User must be logged in
- `/credits/balance` endpoint should return valid data

---

## Test Scenarios

### 1. ✅ View Credit Balance (Normal State)

**Steps:**

1. Navigate to any page (Dashboard, Batch Upload, etc.)
2. Look at top-right navigation header

**Expected:**

```
┌────────────────────┐
│ 🪙 150 credits [↻]│ ← Blue background
└────────────────────┘
```

**What to Check:**

- Balance displays correct number
- Coins icon visible
- Refresh button present
- Blue color (normal state)

---

### 2. ⚠️ Low Credit Warning

**Steps:**

1. Set credits to 5-9 in wallet store
2. Check navigation header

**Expected:**

```
┌────────────────────────────┐
│ 🪙 7 credits [↻] ⚠️ Low   │ ← Red background
└────────────────────────────┘
```

**What to Check:**

- Red background color
- Warning triangle icon
- "Low balance" text displayed

---

### 3. 💵 Single Certificate Export (Sufficient Credits)

**Steps:**

1. Go to Certificate Designer
2. Design a certificate (no CSV)
3. Click "Export PDF" dropdown
4. Click "Export Template (2 credits)"

**Expected:**

- **Confirmation Modal appears:**
  ```
  ┌───────────────────────────────────┐
  │ Confirm Credit Usage          [X] │
  ├───────────────────────────────────┤
  │ ✓ Generate PDF Certificate       │
  │                                   │
  │ Cost per certificate: 🪙 2        │
  │                                   │
  │ Total Cost: 🪙 2                  │
  │                                   │
  │ Current: 150  →  New: 148        │
  │                                   │
  │ [ Cancel ] [ Confirm & Proceed ]  │
  └───────────────────────────────────┘
  ```

5. Click "Confirm & Proceed"

**Expected:**

- PDF downloads
- Modal closes
- Credit balance updates: 150 → 148
- Header shows new balance

---

### 4. 📦 Batch Export - Separate Files (25 Certificates)

**Steps:**

1. Upload CSV with 25 records
2. Design certificate with dynamic fields
3. Click "Export PDF" → "Separate Files (50 credits)"

**Expected Modal:**

```
┌───────────────────────────────────┐
│ Confirm Credit Usage          [X] │
├───────────────────────────────────┤
│ ✓ Generate PDF Certificate       │
│   Processing 25 certificates      │
│                                   │
│ Cost per certificate: 🪙 2        │
│ Quantity: × 25                    │
│ ───────────────────────────────   │
│ Total Cost: 🪙 50                 │
│                                   │
│ Current: 150  →  New: 100        │
│                                   │
│ [ Cancel ] [ Confirm & Proceed ]  │
└───────────────────────────────────┘
```

**After Confirmation:**

- 25 PDFs download sequentially
- Alert: "✓ Successfully generated 25 PDF certificates!"
- Balance: 150 → 100

---

### 5. 📄 Batch Export - Single File (10 Certificates)

**Steps:**

1. Upload CSV with 10 records
2. Click "Export PDF" → "Single File (20 credits)"

**Expected:**

- Modal shows: "1 PDF with 10 pages"
- Total cost: 🪙 20
- Balance: 150 → 130

**After Confirmation:**

- Single PDF with 10 pages downloads
- Balance updates

---

### 6. 🚫 Insufficient Credits

**Steps:**

1. Set credits to 30 (backend or wallet store)
2. Upload CSV with 25 records
3. Try to export (needs 50 credits)

**Expected Modal:**

```
┌───────────────────────────────────┐
│ Confirm Credit Usage          [X] │
├───────────────────────────────────┤
│ ⚠️ Generate PDF Certificate       │
│   Processing 25 certificates      │
│                                   │
│ Total Cost: 🪙 50                 │
│                                   │
│ Current: 30  →  New: -20  (RED)  │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ ⚠️ Insufficient Credits       │ │
│ │ You need 20 more credits      │ │
│ └───────────────────────────────┘ │
│                                   │
│ [ Cancel ] [ Purchase Credits ]   │
└───────────────────────────────────┘
```

**What to Check:**

- "Confirm" button replaced with "Purchase Credits"
- Red balance indicator
- Warning message clear
- Operation blocked

---

### 7. ⚠️ Low Balance After Operation

**Steps:**

1. Set credits to 15
2. Try to export 5 certificates (10 credits)

**Expected Modal:**

```
┌───────────────────────────────────┐
│ Confirm Credit Usage          [X] │
├───────────────────────────────────┤
│ ✓ Generate PDF Certificate       │
│   Processing 5 certificates       │
│                                   │
│ Total Cost: 🪙 10                 │
│                                   │
│ Current: 15  →  New: 5           │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ ⚠️ Your balance will be low   │ │
│ │ after this operation. Consider│ │
│ │ purchasing more credits.      │ │
│ └───────────────────────────────┘ │
│                                   │
│ [ Cancel ] [ Confirm & Proceed ]  │
└───────────────────────────────────┘
```

**What to Check:**

- Yellow warning (not blocking)
- Can still proceed
- Balance goes to 5 (low, but valid)

---

### 8. 🔄 Refresh Credit Balance

**Steps:**

1. Navigate to any page
2. Click the refresh button (↻) next to credits

**Expected:**

- Icon spins (loading animation)
- After 1-2 seconds, balance updates
- If backend updated credits, new value shows

**Manual Test:**

1. Update credits in database to 200
2. Click refresh
3. Should show 200

---

### 9. 👁️ Preview Modal Export

**Steps:**

1. Upload CSV with 5 records
2. Click "Preview" button
3. Navigate through records with Previous/Next
4. Click "Download Current (2 credits)"

**Expected:**

- Confirmation modal appears
- Shows: "Processing 1 certificate"
- Cost: 🪙 2
- After confirm: Current record PDF downloads
- Balance: 150 → 148

---

### 10. 🔁 Multiple Exports in Sequence

**Steps:**

1. Start with 150 credits
2. Export 1 certificate (2 credits) → Balance: 148
3. Immediately export another → Balance: 146
4. Export 5 certificates (10 credits) → Balance: 136

**What to Check:**

- Each operation shows correct current balance
- Credits deduct sequentially
- No race conditions
- Balance always accurate

---

## 🧪 Edge Case Tests

### A. Exact Credit Match

**Setup:** 2 credits remaining  
**Action:** Export 1 certificate (2 credits)  
**Expected:** Success, balance → 0

### B. Zero Credits

**Setup:** 0 credits  
**Action:** Any export attempt  
**Expected:** Insufficient credits modal

### C. Export Failure Scenario

**Setup:** 50 credits  
**Action:** Export fails (network error)  
**Expected:** Credits NOT deducted, error message shown

### D. Cancel Modal

**Setup:** Any credits  
**Action:** Open modal, click Cancel  
**Expected:** No credits deducted, modal closes

### E. Backend Unreachable

**Setup:** Stop backend  
**Action:** Click refresh or try export  
**Expected:** Error message, graceful handling

---

## 🐛 Debugging Checklist

### Issue: Balance not showing

1. Check console for API errors
2. Verify `/credits/balance` endpoint
3. Check network tab for 401/500 errors
4. Confirm user is authenticated

### Issue: Modal not appearing

1. Check browser console for errors
2. Verify `showCreditModal` state
3. Check `checkCreditsAndExecute` is called
4. Inspect React DevTools

### Issue: Credits not deducting

1. Confirm backend deducts on success
2. Check `updateCredits()` is called
3. Verify `fetchCredits()` runs after export
4. Check network response includes new balance

### Issue: Wrong cost displayed

1. Verify `CREDIT_COSTS` constant
2. Check calculation: `cost * count`
3. Confirm `count` parameter correct
4. Check modal props

---

## 📊 Test Data Setup

### Backend Mock Responses:

**Sufficient Credits (150):**

```json
GET /credits/balance
{
  "success": true,
  "credits": 150,
  "userId": "test123"
}
```

**Low Credits (7):**

```json
{
  "success": true,
  "credits": 7,
  "userId": "test123"
}
```

**After Deduction:**

```json
POST /certificates/generate (after 5 PDFs)
{
  "success": true,
  "certificates": [...],
  "creditsUsed": 10,
  "newBalance": 140
}
```

---

## ✅ Success Criteria

All tests pass if:

- ✅ Credit balance always visible
- ✅ Costs clearly displayed
- ✅ Confirmation required before deduction
- ✅ Insufficient credits blocked
- ✅ Low balance warned
- ✅ Credits deduct correctly
- ✅ UI updates in real-time
- ✅ No duplicate charges
- ✅ Error handling graceful
- ✅ Loading states prevent clicks

---

## 🎬 Demo Script

**Quick 2-minute demo flow:**

1. **Show normal state** (150 credits in header)
2. **Single export** → Modal → Confirm → Download → Balance: 148
3. **Upload CSV** (10 records)
4. **Batch export** → Modal shows 20 credits → Confirm → 10 PDFs
5. **Set credits to 5** (low)
6. **Show low warning** in header
7. **Try to export 10 certificates** → Insufficient credits modal
8. **Show Purchase Credits button**

**Total demo time:** ~2 minutes  
**Showcases:** All major features

---

## 📞 Support Commands

### Reset Credits (Development):

```javascript
// In browser console
useWalletStore.getState().setCredits(150);
```

### Force Refresh:

```javascript
// In browser console
await useWalletStore.getState().fetchCredits();
```

### Check Current Balance:

```javascript
// In browser console
console.log(useWalletStore.getState().credits);
```

---

**Happy Testing! 🚀**
