# Testing Guide: Double-Tap Feature

## Pre-Testing Checklist

- [ ] App compiles without errors
- [ ] No TypeScript warnings
- [ ] Dependencies installed
- [ ] Test device/emulator ready
- [ ] Documentation files created

---

## Manual Testing

### Test 1: Basic Double-Tap Functionality
**Objective:** Verify double-tap opens daily log modal

**Steps:**
1. Open the timechart view
2. Locate an activity with a colored indicator
3. Quick tap the cell twice within 1 second
4. Observe: Modal should open immediately

**Expected Result:** ✅ Daily Activity Log Modal appears
**Actual Result:** [ ] Pass [ ] Fail [ ] N/A
**Notes:** ___________________________________________________________

---

### Test 2: Single Tap Does Nothing
**Objective:** Verify single tap doesn't trigger modal

**Steps:**
1. Open the timechart view
2. Find an activity cell
3. Tap once, wait 2+ seconds
4. Observe: Nothing should happen

**Expected Result:** ✅ No modal appears
**Actual Result:** [ ] Pass [ ] Fail [ ] N/A
**Notes:** ___________________________________________________________

---

### Test 3: Slow Double-Tap Not Recognized
**Objective:** Verify taps must be within 300ms window

**Steps:**
1. Tap a cell
2. Wait 1+ seconds
3. Tap the same cell again
4. Observe: Modal should NOT open

**Expected Result:** ✅ No modal (taps too slow)
**Actual Result:** [ ] Pass [ ] Fail [ ] N/A
**Notes:** ___________________________________________________________

---

### Test 4: Double-Tap on Different Cells
**Objective:** Verify double-tap must be on same cell

**Steps:**
1. Tap cell A
2. Quickly tap cell B (different cell)
3. Observe: No modal should appear

**Expected Result:** ✅ No modal (different cells)
**Actual Result:** [ ] Pass [ ] Fail [ ] N/A
**Notes:** ___________________________________________________________

---

### Test 5: Holiday/Weekend Cells Ignored
**Objective:** Verify double-tap doesn't work on non-working days

**Steps:**
1. Identify a holiday cell (light red background)
2. Double-tap the holiday cell
3. Observe: Modal should NOT open

**Expected Result:** ✅ No modal (holiday protected)
**Actual Result:** [ ] Pass [ ] Fail [ ] N/A
**Notes:** ___________________________________________________________

---

### Test 6: Modal Content Loads Correctly
**Objective:** Verify modal displays correct activity details

**Steps:**
1. Double-tap an activity cell
2. Check the modal content

**Expected Result:**
- ✅ Activity name displays
- ✅ Date displays correctly
- ✅ Notes field is empty (for new log)
- ✅ Image gallery is empty
- ✅ Save/Cancel buttons are present

**Actual Result:** [ ] Pass [ ] Fail [ ] N/A
**Notes:** ___________________________________________________________

---

### Test 7: Modal Save Functionality
**Objective:** Verify saving daily log works

**Steps:**
1. Open daily log modal via double-tap
2. Enter notes: "Test entry"
3. Tap Save button
4. Observe: Modal closes, green dot appears

**Expected Result:**
- ✅ Modal closes
- ✅ Green dot (log indicator) appears on cell
- ✅ Success alert shown

**Actual Result:** [ ] Pass [ ] Fail [ ] N/A
**Notes:** ___________________________________________________________

---

### Test 8: Existing Log Loads
**Objective:** Verify previous logs load when modal opens

**Steps:**
1. Save a daily log with notes "First attempt"
2. Double-tap the same cell again
3. Observe: Previous notes should appear

**Expected Result:**
- ✅ Modal opens
- ✅ "First attempt" appears in notes field
- ✅ Can edit and update

**Actual Result:** [ ] Pass [ ] Fail [ ] N/A
**Notes:** ___________________________________________________________

---

### Test 9: Drag and Drop Still Works
**Objective:** Verify double-tap doesn't break drag-and-drop

**Steps:**
1. Long-press (hold) an activity indicator
2. Drag to different date
3. Release

**Expected Result:**
- ✅ Activity drags smoothly
- ✅ Activity repositions correctly
- ✅ No modal opens during drag

**Actual Result:** [ ] Pass [ ] Fail [ ] N/A
**Notes:** ___________________________________________________________

---

### Test 10: Rapid Sequence Handling
**Objective:** Verify multiple taps in sequence work correctly

**Steps:**
1. Tap cell A twice (open modal)
2. Close modal
3. Tap cell A twice again (should open modal again)

**Expected Result:**
- ✅ First double-tap opens modal
- ✅ Modal closes properly
- ✅ Second double-tap opens modal again

**Actual Result:** [ ] Pass [ ] Fail [ ] N/A
**Notes:** ___________________________________________________________

---

### Test 11: Cross-Device Testing (if available)
**Objective:** Verify works on different devices

**Devices to Test:**
- [ ] iPhone (iOS)
- [ ] Android Phone
- [ ] iPad/Tablet
- [ ] Web Browser

**Results:**
| Device | Pass | Fail | Notes |
|--------|------|------|-------|
| iPhone | [ ] | [ ] | |
| Android | [ ] | [ ] | |
| iPad | [ ] | [ ] | |
| Web | [ ] | [ ] | |

---

### Test 12: Performance Check
**Objective:** Verify no performance degradation

**Metrics to Monitor:**
- [ ] Frame rate stable (60fps target)
- [ ] No lag on double-tap
- [ ] Modal opens instantly
- [ ] No memory leaks (RAM stable)
- [ ] Device not heating up

**Actual Performance:** ___________________________________________________________

---

### Test 13: Accessibility Testing
**Objective:** Verify accessibility features work

**Checks:**
- [ ] Screen reader announces cell contents
- [ ] Touch targets are adequate size (44x44px minimum)
- [ ] Modal is keyboard navigable
- [ ] Cancel button easily accessible

**Accessibility Issues Found:** ___________________________________________________________

---

### Test 14: Edge Cases
**Objective:** Verify edge case handling

#### Case 1: Spam Tapping
**Steps:** Tap the same cell 10+ times rapidly
**Expected:** Modal opens on first double-tap, then stabilizes
**Result:** [ ] Pass [ ] Fail

#### Case 2: Multi-touch
**Steps:** Use multiple fingers to tap
**Expected:** Should behave like normal single tap
**Result:** [ ] Pass [ ] Fail

#### Case 3: Long Activity Duration
**Steps:** Double-tap on activity that spans many days
**Expected:** Correct date logged, modal opens
**Result:** [ ] Pass [ ] Fail

#### Case 4: Activity at Project Boundary
**Steps:** Double-tap activity on last day of project
**Expected:** Modal opens normally
**Result:** [ ] Pass [ ] Fail

---

## Regression Testing

### Test R1: Existing Functionality Unchanged
Check these features still work:

- [ ] Add activity
- [ ] Delete activity
- [ ] Add holiday
- [ ] Delete holiday
- [ ] Add subcontractor
- [ ] View timechart
- [ ] Scroll timechart
- [ ] View activity details
- [ ] Edit activity dates
- [ ] Change floor level colors

**Issues Found:** ___________________________________________________________

---

### Test R2: Data Integrity
**Objective:** Verify data isn't corrupted

**Checks:**
- [ ] Activities still save correctly
- [ ] Holiday dates preserved
- [ ] Subcontractor assignments maintained
- [ ] Daily logs persist
- [ ] Images saved with logs
- [ ] No duplicate entries

**Data Issues:** ___________________________________________________________

---

## Browser Console Testing

### Check for Errors
Open developer console (F12 or Cmd+Option+I) and verify:

- [ ] No red error messages
- [ ] No yellow warning messages
- [ ] No undefined variables
- [ ] No memory warnings

**Console Issues:** ___________________________________________________________

---

## Performance Testing

### Memory Usage
```
Initial Load: ________ MB
After 10 double-taps: ________ MB
After 100 double-taps: ________ MB
Increase: ________ MB
```

**Expected:** <5MB increase (minimal)
**Result:** [ ] Pass [ ] Fail

### Tap Response Time
```
First tap to visual feedback: ________ ms
Second tap to modal open: ________ ms
```

**Expected:** <100ms
**Result:** [ ] Pass [ ] Fail

---

## Test Summary

### Results Count
- Total Tests: 14 main + 8 edge + 6 regression = 28
- Passed: ____
- Failed: ____
- N/A: ____
- Success Rate: _____%

### Critical Issues (Block Release)
1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

### Major Issues (Should Fix)
1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

### Minor Issues (Nice to Fix)
1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

---

## Sign-Off

**Tester Name:** ___________________________
**Date:** ___________________________
**Platform(s) Tested:** ___________________________
**Overall Assessment:** [ ] Ready for Release [ ] Needs Fixes [ ] Major Issues

**Comments:**
___________________________________________________________
___________________________________________________________
___________________________________________________________

---

## Known Limitations

1. **Double-tap window:** 300ms (fixed)
   - Can be adjusted if needed
   - May vary based on device performance

2. **Accidental double-taps:**
   - Users might accidentally trigger modal
   - Could implement visual preview on first tap

3. **Accessibility:**
   - Double-tap harder for users with motor difficulties
   - Consider adding alternative long-press for a11y

---

## Next Steps

- [ ] Complete all manual tests
- [ ] Fix any critical issues
- [ ] Document any device-specific issues
- [ ] Gather user feedback
- [ ] Monitor app usage for issues
- [ ] Consider implementing optional long-press for accessibility

---

**Last Updated:** February 15, 2026
**Version:** 1.0.0 Testing
