# Floor Filter Fix - Complete Testing Guide

## 🧪 Test Scenario 1: Single Parent with Direct Child (2-Level Hierarchy)

### Setup
1. Create Activity: **Foundation Work**
   - Dates: Feb 10 - Feb 15
   - Floor: **Ground Floor**
   - Contractor: ABC Concrete

2. Create Child Activity: **Foundation Inspection**
   - Link to Foundation Work
   - Dates: Feb 16 - Feb 18
   - Floor: **Ground Floor**
   - Contractor: Quality Inspector

### Test Case 1.1: Filter All Floors
**Action**: Click "All Floors" in floor filter  
**Expected**:
- Foundation Work → ✅ Full opacity
- Foundation Inspection → ✅ Full opacity

**Actual**: _______________

---

### Test Case 1.2: Filter Ground Floor
**Action**: Click "Ground Floor" in floor filter  
**Expected**:
- Foundation Work → ✅ Full opacity
- Foundation Inspection → ✅ Full opacity (on same floor)

**Actual**: _______________

---

### Test Case 1.3: Filter First Floor
**Action**: Click "First Floor" in floor filter  
**Expected**:
- Foundation Work → ⚪ 0.25 opacity (faded)
- Foundation Inspection → ⚪ 0.25 opacity (faded)

**Actual**: _______________

---

## 🧪 Test Scenario 2: Parent with Multiple Children on Different Floors (3-Level)

### Setup
1. Create Activity: **Flooring Installation**
   - Dates: Mar 1 - Mar 10
   - Floor: **Ground Floor**
   - Contractor: ABC Flooring

2. Create Child 1: **Tile Ground Floor**
   - Dates: Mar 11 - Mar 20
   - Floor: **Ground Floor**
   - Contractor: ABC Flooring

3. Create Child 2: **Tile First Floor**
   - Dates: Mar 11 - Mar 20
   - Floor: **First Floor**
   - Contractor: ABC Flooring

### Test Case 2.1: Filter All Floors
**Action**: Click "All Floors"  
**Expected**:
- Flooring Installation → ✅ Full opacity
- Tile Ground Floor → ✅ Full opacity
- Tile First Floor → ✅ Full opacity

**Actual**: _______________

---

### Test Case 2.2: Filter Ground Floor
**Action**: Click "Ground Floor"  
**Expected**:
- Flooring Installation → ✅ Full opacity (matches)
- Tile Ground Floor → ✅ Full opacity (matches)
- Tile First Floor → ⚪ 0.25 opacity (faded, different floor)

**Actual**: _______________

---

### Test Case 2.3: Filter First Floor
**Action**: Click "First Floor"  
**Expected**:
- Flooring Installation → ⚪ 0.25 opacity (faded, different floor)
- Tile Ground Floor → ⚪ 0.25 opacity (faded, different floor)
- Tile First Floor → ✅ Full opacity (matches)

**Actual**: _______________

---

## 🧪 Test Scenario 3: Grandchild Activities (4-Level Hierarchy)

### Setup
1. Create Activity: **Painting**
   - Dates: Apr 1 - Apr 5
   - Floor: **Ground Floor**
   - Contractor: ABC Painters

2. Create Child: **Prep Ground Floor**
   - Dates: Apr 6 - Apr 8
   - Floor: **Ground Floor**
   - Contractor: ABC Painters

3. Create Grandchild: **Apply Primer Ground Floor**
   - Dates: Apr 9 - Apr 10
   - Floor: **Ground Floor**
   - Contractor: ABC Painters

4. Create Another Child: **Paint First Floor**
   - Dates: Apr 6 - Apr 10
   - Floor: **First Floor**
   - Contractor: ABC Painters

### Test Case 3.1: Filter Ground Floor
**Action**: Click "Ground Floor"  
**Expected**:
- Painting → ✅ Full opacity
- Prep Ground Floor → ✅ Full opacity
- Apply Primer Ground Floor (grandchild) → ✅ Full opacity
- Paint First Floor → ⚪ 0.25 opacity (faded)

**Actual**: _______________

---

### Test Case 3.2: Filter First Floor
**Action**: Click "First Floor"  
**Expected**:
- Painting → ⚪ 0.25 opacity (parent doesn't match)
- Prep Ground Floor → ⚪ 0.25 opacity (child doesn't match)
- Apply Primer Ground Floor → ⚪ 0.25 opacity (grandchild doesn't match)
- Paint First Floor → ✅ Full opacity (matches)

**Actual**: _______________

---

## 🧪 Test Scenario 4: Drag Parent with Filtered Children

### Setup
Same as Scenario 2:
- Flooring Installation (Ground Floor)
  - Tile Ground Floor (Ground Floor)
  - Tile First Floor (First Floor)

### Test Case 4.1: Drag Parent While Filtered
**Action**: 
1. Filter to "Ground Floor"
2. Drag "Flooring Installation" right 5 days
3. Observe all activities move

**Expected**:
- Flooring Installation → ✅ Moves 5 days right
- Tile Ground Floor → ✅ Moves 5 days right
- Tile First Floor → ⚪ Faded, but also moves 5 days right

**Actual**: _______________

---

## 🧪 Test Scenario 5: Daily Activity Logs with Floor Filter

### Setup
From Scenario 2, with activities already created

### Test Case 5.1: Log on Filtered Activity
**Action**:
1. Filter to "Ground Floor"
2. Long-press "Tile Ground Floor" cell on Mar 15
3. Add work notes: "Installed tile successfully"
4. Save log
5. Look for green dot indicator

**Expected**:
- Green dot appears on Mar 15 cell for "Tile Ground Floor"
- Dot is visible at full opacity (not faded)

**Actual**: _______________

---

### Test Case 5.2: Log on Faded Activity
**Action**:
1. Filter to "Ground Floor"  (Tile First Floor is faded)
2. Long-press "Tile First Floor" cell on Mar 16
3. Add work notes: "Prepared tiles"
4. Save log
5. Look for green dot

**Expected**:
- Green dot appears on Mar 16 cell for "Tile First Floor"
- Dot is visible even though row is faded

**Actual**: _______________

---

## 🧪 Test Scenario 6: Status Buttons with Floor Filter

### Setup
From Scenario 2

### Test Case 6.1: Mark Faded Child as Complete
**Action**:
1. Filter to "Ground Floor" (Tile First Floor is faded)
2. Click checkmark (✓) on "Tile First Floor" row
3. Observe strikethrough appears

**Expected**:
- Text shows strikethrough
- Status is saved even though row is faded

**Actual**: _______________

---

### Test Case 6.2: Mark Faded Child as Started
**Action**:
1. Filter to "Ground Floor" (Tile First Floor is faded)
2. Click "Start" button on "Tile First Floor" row
3. Observe button changes to "Started"

**Expected**:
- Button shows "Started" with green background
- Status is saved even though row is faded

**Actual**: _______________

---

## ✅ Regression Tests

### Test R1: Non-Filtered Activities Still Work
**Setup**: Default state with no floor filter active  
**Action**: Create 2 activities on different floors  
**Expected**: Both show at full opacity

**Actual**: _______________

---

### Test R2: Drag Without Floor Filter
**Setup**: No active floor filter  
**Action**: Drag any parent with children  
**Expected**: All activities move together

**Actual**: _______________

---

### Test R3: Child Activity Creation
**Setup**: Any parent activity  
**Action**: Create multiple child activities on different floors  
**Expected**: All children appear in hierarchy

**Actual**: _______________

---

## 📋 Summary

| Test | Result | Notes |
|------|--------|-------|
| 1.1 - All Floors Filter | ✅/❌ | _____________ |
| 1.2 - Same Floor Filter | ✅/❌ | _____________ |
| 1.3 - Different Floor Filter | ✅/❌ | _____________ |
| 2.1 - Multi-Child All Floors | ✅/❌ | _____________ |
| 2.2 - Multi-Child Same Floor | ✅/❌ | _____________ |
| 2.3 - Multi-Child Different Floor | ✅/❌ | _____________ |
| 3.1 - Grandchild Same Floor | ✅/❌ | _____________ |
| 3.2 - Grandchild Different Floor | ✅/❌ | _____________ |
| 4.1 - Drag with Filter | ✅/❌ | _____________ |
| 5.1 - Log on Visible Child | ✅/❌ | _____________ |
| 5.2 - Log on Faded Child | ✅/❌ | _____________ |
| 6.1 - Complete Faded Child | ✅/❌ | _____________ |
| 6.2 - Start Faded Child | ✅/❌ | _____________ |
| R1 - No Filter Works | ✅/❌ | _____________ |
| R2 - Drag No Filter | ✅/❌ | _____________ |
| R3 - Child Creation | ✅/❌ | _____________ |

---

## 🐛 If Tests Fail

### Child Activities Not Showing
**Possible Causes**:
- Cache not cleared - try force refresh
- Floor filter state not updating - check console for filter changes
- Child not rendered in parent view - check React DevTools

**Debug Steps**:
1. Check browser console for 🎨 [RenderChild] logs
2. Look for "childMatchesFilter" value in logs
3. Verify `linkedActivity.floorLevelId` matches filter

---

### Floor Filter Not Working
**Possible Causes**:
- Opacity not applied to child row
- activeFloorFilter state incorrect
- Floor level IDs mismatch

**Debug Steps**:
1. Check console for 🟣 [Render] logs showing child count
2. Verify opacity value is 0.25 or 1
3. Check that `activeFloorFilter` state changes when clicking filter buttons

---

## 📞 Questions?

Refer to:
- **FLOOR_FILTER_FIX.md** - Technical details
- **FLOOR_FILTER_QUICK_REF.md** - Quick reference
- **FIXES_COMPLETE_SUMMARY.md** - Complete overview

---

**Test Date**: _______________

**Tester Name**: _______________

**Overall Status**: _______________

**Notes**: _________________________________________________________________
