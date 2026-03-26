# Hierarchical Floor Filter Testing - Complete Guide

## 🎯 Overview

This guide covers testing the fix for hierarchical activities with deep linking (grandchildren, great-grandchildren, etc.) not showing up when their floor level matches the applied filter.

---

## 🧪 Test Scenario 1: Three-Level Hierarchy (Parent → Child → Grandchild)

### Setup

**Activity X** (Parent)
- Dates: Feb 10-15
- Floor: **Ground Floor** (red)
- Contractor: ABC Corp

**Activity Y** (Child - linked to X)
- Dates: Feb 16-20
- Floor: **First Floor** (teal)
- Contractor: ABC Corp
- Offset: +1 day from X end date

**Activity Z** (Grandchild - linked to Y)
- Dates: Feb 21-25
- Floor: **Third Floor** (blue)
- Contractor: ABC Corp
- Offset: +1 day from Y end date

### Test T1.1: Filter "All Floors"

**Action**: Click "All Floors" in floor filter

**Expected**:
- X: ✅ Full opacity (visible)
- Y: ✅ Full opacity (visible)
- Z: ✅ Full opacity (visible)

**Actual**: ✅ / ❌ _____________

**Notes**: _________________________________________________________________

---

### Test T1.2: Filter "Ground Floor"

**Action**: Click "Ground Floor" in floor filter

**Expected**:
- X (Ground): ✅ Full opacity (matches filter)
- Y (First): ⚪ Faded 0.25 opacity (doesn't match)
- Z (Third): ⚪ Faded 0.25 opacity (doesn't match)

**Actual**: ✅ / ❌ _____________

**Notes**: _________________________________________________________________

---

### Test T1.3: Filter "First Floor"

**Action**: Click "First Floor" in floor filter

**Expected**:
- X (Ground): ⚪ Faded 0.25 opacity (doesn't match)
- Y (First): ✅ Full opacity (matches filter) ← KEY TEST!
- Z (Third): ⚪ Faded 0.25 opacity (doesn't match)

**Before Fix**: ❌ Y would be faded (WRONG!)
**After Fix**: ✅ Y should be VISIBLE

**Actual**: ✅ / ❌ _____________

**Notes**: _________________________________________________________________

---

### Test T1.4: Filter "Third Floor"

**Action**: Click "Third Floor" in floor filter

**Expected**:
- X (Ground): ⚪ Faded 0.25 opacity (doesn't match)
- Y (First): ⚪ Faded 0.25 opacity (doesn't match)
- Z (Third): ✅ Full opacity (matches filter) ← KEY TEST!

**Before Fix**: ❌ Z would be faded (WRONG!)
**After Fix**: ✅ Z should be VISIBLE

**Actual**: ✅ / ❌ _____________

**Notes**: _________________________________________________________________

---

## 🧪 Test Scenario 2: Four-Level Hierarchy

### Setup

**Activity A** (Level 1 - Parent)
- Dates: Mar 1-5
- Floor: **Ground Floor**
- Contractor: ABC

**Activity B** (Level 2 - Child of A)
- Dates: Mar 6-10
- Floor: **First Floor**
- Offset: +1

**Activity C** (Level 3 - Child of B)
- Dates: Mar 11-15
- Floor: **Second Floor**
- Offset: +1

**Activity D** (Level 4 - Child of C)
- Dates: Mar 16-20
- Floor: **Third Floor**
- Offset: +1

---

### Test T2.1: Filter "Second Floor"

**Expected**:
- A (Ground): ⚪ Faded
- B (First): ⚪ Faded
- C (Second): ✅ VISIBLE ← Must show!
- D (Third): ⚪ Faded

**Before Fix**: ❌ C would be faded
**After Fix**: ✅ C should be visible

**Actual**: ✅ / ❌ _____________

---

### Test T2.2: Filter "Third Floor"

**Expected**:
- A (Ground): ⚪ Faded
- B (First): ⚪ Faded
- C (Second): ⚪ Faded
- D (Third): ✅ VISIBLE ← Must show!

**Before Fix**: ❌ D would be faded
**After Fix**: ✅ D should be visible

**Actual**: ✅ / ❌ _____________

---

## 🧪 Test Scenario 3: Multiple Branches (Diamond Pattern)

### Setup

**Parent X** (Ground Floor)
  ├─ Child Y (First Floor)
  │  └─ Grandchild Z1 (Third Floor)
  │
  └─ Child Y2 (Second Floor)
     └─ Grandchild Z2 (Third Floor)

---

### Test T3.1: Filter "Third Floor"

**Expected**: Both Z1 and Z2 should be visible

**Actual**: ✅ / ❌ _____________

---

## 🧪 Test Scenario 4: Interactive Features with Filtered Hierarchies

### Setup: 3-level hierarchy X(Ground) → Y(First) → Z(Third)

---

### Test T4.1: Mark Filtered Child as Complete

**Action**:
1. Filter to "First Floor"
2. Click ✓ checkmark on Y (child)
3. Observe strikethrough

**Expected**: Y shows with strikethrough (visible at full opacity)

**Actual**: ✅ / ❌ _____________

---

### Test T4.2: Mark Filtered Grandchild as Started

**Action**:
1. Filter to "Third Floor"
2. Click "Start" button on Z (grandchild)
3. Observe button changes to "Started"

**Expected**: Z shows "Started" button (visible at full opacity)

**Actual**: ✅ / ❌ _____________

---

### Test T4.3: Daily Log on Filtered Grandchild

**Action**:
1. Filter to "Third Floor"
2. Long-press Z cell on Mar 19
3. Add work notes
4. Save log
5. Look for green dot

**Expected**: Green dot appears on Z at full opacity

**Actual**: ✅ / ❌ _____________

---

### Test T4.4: Delete Filtered Activity

**Action**:
1. Filter to "Third Floor"
2. Click ✕ on Z (should show and be deletable)
3. Confirm delete

**Expected**: Z can be deleted (not hidden by opacity)

**Actual**: ✅ / ❌ _____________

---

## 🧪 Test Scenario 5: Drag Operations with Filters

### Setup: 3-level hierarchy

---

### Test T5.1: Drag Parent While Filtered to Child's Floor

**Action**:
1. Filter to "First Floor"
2. Drag X right 5 days
3. Observe Y and Z also move

**Expected**:
- X moves (visible - faded but interactive) ⚪
- Y moves (visible - full opacity) ✅
- Z moves (visible - faded) ⚪

**Actual**: ✅ / ❌ _____________

---

### Test T5.2: Drag Child While Filtered to Its Floor

**Action**:
1. Filter to "First Floor"
2. Drag Y right 5 days
3. Observe X stays, Y and Z move

**Expected**:
- X stays (parent not affected)
- Y moves (visible - full opacity) ✅
- Z moves with Y (visible - faded) ⚪

**Actual**: ✅ / ❌ _____________

---

## 📋 Edge Cases

### Edge Case E1: Empty Hierarchy (No Children)

**Setup**: Activity X with no children

**Test**: Filter should work normally

**Actual**: ✅ / ❌ _____________

---

### Edge Case E2: Single Activity (Not in Group)

**Setup**: One activity (not grouped)

**Test**: Filter to its floor should show it at full opacity

**Actual**: ✅ / ❌ _____________

---

### Edge Case E3: Very Deep Hierarchy (5+ Levels)

**Setup**: X → Y → Z → W → V all on different floors

**Test**: Filter to deepest level (V's floor)

**Expected**: V visible at full opacity

**Actual**: ✅ / ❌ _____________

---

## 📊 Summary Table

| Test | Scenario | Result | Notes |
|------|----------|--------|-------|
| T1.1 | 3-level, All Floors | ✅/❌ | |
| T1.2 | 3-level, Ground Floor | ✅/❌ | |
| T1.3 | 3-level, First Floor | ✅/❌ | KEY |
| T1.4 | 3-level, Third Floor | ✅/❌ | KEY |
| T2.1 | 4-level, Second Floor | ✅/❌ | KEY |
| T2.2 | 4-level, Third Floor | ✅/❌ | KEY |
| T3.1 | Multiple branches | ✅/❌ | |
| T4.1 | Mark child complete | ✅/❌ | |
| T4.2 | Mark grandchild started | ✅/❌ | |
| T4.3 | Daily log on grandchild | ✅/❌ | |
| T4.4 | Delete filtered activity | ✅/❌ | |
| T5.1 | Drag parent (filtered) | ✅/❌ | |
| T5.2 | Drag child (filtered) | ✅/❌ | |
| E1 | Empty hierarchy | ✅/❌ | |
| E2 | Single activity | ✅/❌ | |
| E3 | 5+ level hierarchy | ✅/❌ | |

---

## 🔍 Debugging If Tests Fail

### If Filtered Activity Still Hidden:

**Possible Causes**:
1. Cache not cleared
2. Component not re-rendering
3. Opacity still multiplying (old code)

**Debug Steps**:
1. Check browser DevTools React Inspector
2. Look for multiple `<View>` wrappers with opacity
3. Verify only direct parent has opacity, children don't
4. Check console for render logs (🎨 [RenderChild])

---

### If Drag Not Working:

**Possible Causes**:
1. Child still inheriting parent opacity
2. Interaction disabled on faded elements

**Debug Steps**:
1. Verify opacity changes don't affect interactivity
2. Check that faded activities are still responsive
3. Test drag on non-filtered activities first

---

## ✅ Success Criteria

**All tests must pass for fix to be complete:**

- [ ] 3-level: First Floor filter shows child (T1.3) ✅
- [ ] 3-level: Third Floor filter shows grandchild (T1.4) ✅
- [ ] 4-level: Deep levels visible when filtered (T2.1, T2.2) ✅
- [ ] Multiple branches work (T3.1) ✅
- [ ] Interactive features work on filtered activities (T4.*) ✅
- [ ] Drag works with filters (T5.*) ✅
- [ ] Edge cases handled (E*) ✅

---

## 📝 Test Report

**Date Tested**: _________________
**Tester Name**: _________________
**Environment**: iOS / Android / Both
**App Version**: _________________

**Overall Status**: PASS ✅ / FAIL ❌ / PARTIAL ⚠️

**Critical Issues Found**: 
_________________________________________________________________

**Additional Notes**:
_________________________________________________________________

---

**Remember**: The key fix is that child/grandchild activities on the FILTERED floor should now be FULLY VISIBLE, not faded by parent opacity!
