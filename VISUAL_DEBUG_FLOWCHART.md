# Linking Process Flow - Visual Debug Guide

```
USER CLICKS LINK BUTTON ON ACTIVITY 2
│
├─→ 🔗 [LINK-BUTTON] logs appear
│   Shows: Activity 2 ID, name, parent ID
│   ✅ Check: Is this the activity you clicked link on?
│
└─→ Link Modal Opens
    │
    ├─→ USER SELECTS ACTIVITY 1 AS TARGET
    │   │
    │   ├─→ 🔗 [LINK-MODAL] logs appear
    │   │   Shows: Target Activity 1 ID, Source Activity 2 ID
    │   │   ✅ Check: Are both IDs different?
    │   │
    │   └─→ USER SELECTS OFFSET (e.g., 0 or +1)
    │       (no logs for this, just internal state)
    │
    └─→ USER CLICKS "DONE"
        │
        ├─→ 🟢 [LINK-HANDLER-START] appears
        │   │
        │   ├─→ 🔵 [LINK-HANDLER] Current state
        │   │   Shows: Source ID, Target ID, Offset, etc.
        │   │   ✅ Check: Are source & target IDs set correctly?
        │   │
        │   ├─→ 🔵 [LINK-HANDLER] Activity lookup
        │   │   Shows: Both activities found (true/false)
        │   │   ✅ Check: sourceFound = true, targetFound = true?
        │   │
        │   ├─→ 🔵 [LINK-HANDLER] Offset value: X
        │   │   ✅ Check: Is this the offset you selected?
        │   │
        │   ├─→ 🟢 [LINK-HANDLER] Calculated new dates
        │   │   Shows: newSourceStartDate, newSourceEndDate
        │   │   ✅ Check: Do dates reflect the offset?
        │   │       Math: targetEndDate + offset = newSourceStartDate
        │   │
        │   ├─→ 🟢 [LINK-HANDLER] Prepared updates
        │   │   Shows: sourceUpdates, targetChildIds
        │   │   ✅ Check: Does sourceUpdates have:
        │   │       - parentActivityId = TARGET's ID?
        │   │       - startDate = newSourceStartDate?
        │   │       - endDate = newSourceEndDate?
        │   │
        │   ├─→ 🟡 [LINK-HANDLER] ➡️ Calling onUpdateActivity for SOURCE
        │   │   │
        │   │   ├─→ ✅ [LINK-HANDLER] Source activity update callback completed
        │   │   │   (sent update to backend/parent handler)
        │   │   │
        │   │   └─→ ⚠️ If no "completed" message:
        │   │       - Update callback might have failed
        │   │       - Check onUpdateActivity function
        │   │
        │   ├─→ 🟡 [LINK-HANDLER] ➡️ Calling onUpdateActivity for TARGET
        │   │   │
        │   │   ├─→ ✅ [LINK-HANDLER] Target activity update callback completed
        │   │   │   (sent update to backend/parent handler)
        │   │   │
        │   │   └─→ ⚠️ If no "completed" message:
        │   │       - Update callback might have failed
        │   │       - Check onUpdateActivity function
        │   │
        │   ├─→ ✅ [LINK-HANDLER] Both updates called successfully
        │   │
        │   ├─→ 🟡 [LINK-HANDLER] Resetting linking state...
        │   │   (clearing all link modal state)
        │   │
        │   └─→ ✅ [LINK-HANDLER-COMPLETE] Linking process finished successfully
        │
        ├─→ ❌ PROBLEM SCENARIO: 🟡 [SUBMIT-ACTIVITY] appears here
        │   │
        │   ├─→ This means activity creation is being triggered
        │   │   (should NOT happen when linking existing activities!)
        │   │
        │   ├─→ Shows: confirmedLinkedCount, activityName
        │   │   ⚠️ WARNING: Why is a new activity being created?
        │   │
        │   └─→ ✅ [SUBMIT-ACTIVITY] Activity submission completed
        │       (This is the BUG - new activity was created instead of linking)
        │
        └─→ ✅ GOOD SCENARIO: No more logs appear
            Activity should now be updated with new dates and parent link


═════════════════════════════════════════════════════════════════════

DIAGNOSIS DECISION TREE:

┌─ Do you see [LINK-BUTTON] logs?
│  └─ NO → Link button click handler didn't fire
│          Check: Is the button clickable? Is component rendering?
│
├─ Do you see [LINK-MODAL] logs?
│  └─ NO → Target selection didn't fire
│          Check: Can you click on target activities?
│
├─ Do you see [LINK-HANDLER] logs?
│  └─ NO → Done button click didn't fire
│          Check: Is Done button clickable?
│
├─ Do you see "Activity lookup" shows sourceFound = false?
│  └─ YES → Source activity not in timechart
│           Check: Did you save Activity 2?
│
├─ Do you see "Activity lookup" shows targetFound = false?
│  └─ YES → Target activity not in timechart
│           Check: Did you save Activity 1?
│
├─ Do you see "Both updates called successfully"?
│  └─ NO → One of the onUpdateActivity calls failed
│         Check: handleSaveEditActivity or onUpdateActivity callbacks
│
├─ Do you see [SUBMIT-ACTIVITY] after [LINK-HANDLER-COMPLETE]?
│  └─ YES → THIS IS THE BUG!
│           Activity creation triggered after linking
│           Check: What's calling _submitActivity?
│           Where: handleAddActivity function
│
└─ Do you see [LINK-HANDLER-COMPLETE] then nothing?
   └─ YES → Linking worked!
            If activity didn't update, check the parent handler
            that processes the onUpdateActivity calls
```

---

## Quick Diagnostic Checklist

✅ **During linking process, I see:**
- [ ] [LINK-BUTTON] logs
- [ ] [LINK-MODAL] logs  
- [ ] [LINK-HANDLER] logs with "Both activities found"
- [ ] "Calculated new dates" with correct offset
- [ ] "Both updates called successfully"

❌ **I should NOT see:**
- [ ] Any "sourceFound = false" 
- [ ] Any "targetFound = false"
- [ ] Any error logs
- [ ] [SUBMIT-ACTIVITY] logs after linking

⚠️ **If I see [SUBMIT-ACTIVITY] after [LINK-HANDLER], something is wrong:**
- Check the `confirmedLinkedCount`
- Check the `activityName` - is it Activity 2?
- This reveals where the unintended activity creation is coming from

---

## How to Share Logs Effectively

1. **Reproduce the issue** using the step-by-step guide above
2. **Copy entire console output** from start to finish
3. **Highlight** (or surround with lines) the key sections:
   ```
   === [LINK-BUTTON] - User clicks link button
   === [LINK-MODAL] - User selects target  
   === [LINK-HANDLER] - All linking logic
   === [SUBMIT-ACTIVITY] - If this appears, it's the problem
   ```
4. **Tell me**:
   - Did the activity's dates change? (Yes/No)
   - Did Activity 2 become a child of Activity 1? (Yes/No)
   - Was a duplicate activity created? (Yes/No)

This information + the console logs will help me fix the issue quickly!
