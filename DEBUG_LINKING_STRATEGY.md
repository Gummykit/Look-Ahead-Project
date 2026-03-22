# Debug Linking Strategy - Console Logging Guide

## Overview
Comprehensive JSX logging has been added throughout the activity linking workflow to trace exactly what's happening at each step. All logs are color-coded with emojis for easy identification.

---

## Log Sections and What They Track

### 1. 🔗 LINK-BUTTON - Activity Row Link Button Click
**Location**: When user clicks the 🔗 link button on an activity row

**Logs**:
```
═══════════════════════════════════════════════════════════════
🔗 [LINK-BUTTON] Link button clicked in activity row
═══════════════════════════════════════════════════════════════
🔗 [LINK-BUTTON] Activity details: {
  primaryActivityId,
  primaryActivityName,
  primaryActivityParentId,
  editingActivityId
}
🔗 [LINK-BUTTON] State set, opening modal...
```

**What to check**:
- Is `primaryActivityId` the activity you clicked link on?
- Is `editingActivityId` null? (Should be, unless you're in edit mode)
- Does the modal actually open?

---

### 2. 🔗 LINK-MODAL - Target Activity Selection
**Location**: When user clicks on a target activity in the link modal

**Logs**:
```
🔗 [LINK-MODAL] Target activity selected: {
  targetId,
  targetName,
  sourceId
}
```

**What to check**:
- Is `sourceId` set correctly (the activity you want to link)?
- Is `targetId` a DIFFERENT activity?
- Is it showing the right activity names?

---

### 3. 🟢 LINK-HANDLER - Main Linking Logic
**Location**: When user clicks "Done" in the link modal

**Detailed Logs** (grouped by === separators):
```
═══════════════════════════════════════════════════════════════
🟢 [LINK-HANDLER-START] handleLinkActivities called
═══════════════════════════════════════════════════════════════
🔵 [LINK-HANDLER] Current state: {
  linkingSourceActivityId,
  selectedLinkTargetActivityId,
  linkOffsetDays,
  linkUseCustomOffset,
  linkCustomOffset,
  editingActivityId
}

🔵 [LINK-HANDLER] Activity lookup: {
  sourceId,
  sourceFound (true/false),
  sourceName,
  sourceParentId,  // ⚠️ Should be null if not linked yet
  targetId,
  targetFound (true/false),
  targetName,
  targetParentId
}

✅ [LINK-HANDLER] Both activities found, proceeding with linking...

🔵 [LINK-HANDLER] Offset value: (the calculated offset)

🟡 [LINK-HANDLER] [In edit mode / Not in edit mode] - using [form/saved] duration: X

🟢 [LINK-HANDLER] Calculated new dates: {
  targetEndDate,
  offsetVal,
  sourceDuration,
  newSourceStartDate,     // ✅ Should reflect offset
  newSourceEndDate
}

🟢 [LINK-HANDLER] Prepared updates: {
  sourceActivityId,
  sourceUpdates {
    parentActivityId,     // ✅ Should be target's ID
    startDate,           // ✅ Should reflect offset
    endDate,             // ✅ Should reflect offset
    duration
  },
  targetActivityId,
  targetChildIds           // ✅ Should include source's ID
}

🟡 [LINK-HANDLER] ➡️ Calling onUpdateActivity for SOURCE activity...
✅ [LINK-HANDLER] Source activity update callback completed

🟡 [LINK-HANDLER] ➡️ Calling onUpdateActivity for TARGET activity...
✅ [LINK-HANDLER] Target activity update callback completed

✅ [LINK-HANDLER] Both updates called successfully

🟡 [LINK-HANDLER] Resetting linking state...

═══════════════════════════════════════════════════════════════
✅ [LINK-HANDLER-COMPLETE] Linking process finished successfully
═══════════════════════════════════════════════════════════════
```

**CRITICAL CHECKS**:
- ✅ `sourceFound` and `targetFound` both TRUE?
- ✅ `sourceParentId` NULL before linking?
- ✅ Offset calculation correct?
- ✅ `newSourceStartDate` reflects offset?
- ✅ First `onUpdateActivity` call successful?
- ✅ Second `onUpdateActivity` call successful?
- ⚠️ If you see "Linking process finished successfully" but activity didn't update, the problem is in the handler that processes `onUpdateActivity` calls

---

### 4. 🟡 EDIT & 🟡 ADD-ACTIVITY - Edit/Add Activity Modal
**Location**: When opening/closing the edit or add activity modal

**Logs**:
```
🟡 [EDIT] handleOpenEditActivity called for activity: {
  id,
  name,
  parentActivityId
}
🟡 [EDIT] Setting linkingSourceActivityId to: [activity id]

🟡 [ADD-ACTIVITY] handleAddActivity called
🟡 [ADD-ACTIVITY] Current state: {
  editingActivityId,
  activityName,
  linkingSourceActivityId
}
```

**What to check**:
- When opening a saved activity to edit, does `linkingSourceActivityId` get set?
- When closing without saving, does it get reset to null?
- When saving, does it get reset to null?

---

### 5. 🟡 SUBMIT-ACTIVITY - Activity Creation/Update
**Location**: When submitting a new or edited activity

**Logs**:
```
═══════════════════════════════════════════════════════════════
🟡 [SUBMIT-ACTIVITY] _submitActivity called
═══════════════════════════════════════════════════════════════
🟡 [SUBMIT-ACTIVITY] Parameters: {
  confirmedLinkedCount,  // How many linked activities to create
  editingActivityId,     // null if creating, ID if editing
  activityName
}

✅ [SUBMIT-ACTIVITY] Calling onAddActivities with X activities

// OR

🟡 [SUBMIT-ACTIVITY] Calling onAddActivity (no linked activities)
🟡 [SUBMIT-ACTIVITY] Parent activity: {
  id,
  name
}

═══════════════════════════════════════════════════════════════
✅ [SUBMIT-ACTIVITY] Activity submission completed
═══════════════════════════════════════════════════════════════
```

**What to check**:
- ⚠️ Is `_submitActivity` being called when you didn't press "Done" on the activity form?
- ✅ Should NOT see "Calling onAddActivity" when linking existing activities
- ✅ After linking, should NOT see activity creation logs

---

## How to Use This for Debugging

### Scenario 1: "Duplicate activity is being created"
1. Click link button on Activity 2 → Check LINK-BUTTON logs
2. Select Activity 1 as target, set offset → Check LINK-MODAL logs
3. Click Done → Check LINK-HANDLER logs
   - ✅ Do you see "Both updates called successfully"?
4. Check SUBMIT-ACTIVITY logs
   - ⚠️ If you see "Calling onAddActivity" AFTER the linking handler, something is triggering activity creation
   - Check if `_submitActivity` is being called unexpectedly

### Scenario 2: "Offset not applied"
1. In LINK-HANDLER logs, look for "Calculated new dates"
   - Is `newSourceStartDate` correct?
   - Does it include the offset?
2. Check "Prepared updates" section
   - Does `startDate` in sourceUpdates match the calculated date?
3. If calculations are correct but activity doesn't move, the problem is in the parent handler that processes these updates

### Scenario 3: "Modal closes but nothing happened"
1. Check LINK-HANDLER logs
   - Do you see "Activity lookup" section?
   - Are both activities found?
   - If sourceFound or targetFound is FALSE, activities aren't in the timechart
2. Check if `selectedLinkTargetActivityId` is null
   - If yes, user didn't select a target
3. If all validations pass but no updates happen, the problem is in the `onUpdateActivity` callback

---

## Key Log Markers

| Emoji | Meaning |
|-------|---------|
| 🔗 | Link button or link modal action |
| 🟢 | Major milestone reached / Success |
| 🟡 | Information / Intermediate step |
| 🔵 | Detailed diagnostic info |
| ❌ | Error / Validation failure |
| ✅ | Specific action completed |
| ⚠️ | Warning / Unexpected behavior |
| ➡️ | About to call a function |
| === | Section divider for easy scrolling |

---

## Pro Tips for Console Debugging

1. **Filter logs in Chrome DevTools**:
   - Open Console
   - Type in the filter: `LINK-HANDLER` to see only linking logs
   - Or type `SUBMIT-ACTIVITY` to see only activity creation logs

2. **Follow the flow**:
   - LINK-BUTTON → LINK-MODAL → LINK-HANDLER → (state should change)
   - If you see SUBMIT-ACTIVITY after LINK-HANDLER, something is triggering activity creation

3. **Check state consistency**:
   - `sourceId` in LINK-BUTTON should equal `sourceId` in LINK-HANDLER
   - `editingActivityId` should be null when linking from the activity row

4. **Verify calculations**:
   - Calculate offset manually:
     - Target end date + offset days = Source new start date
   - Check "Calculated new dates" section matches your math

5. **Watch for state resets**:
   - After successful link, `linkingSourceActivityId` should become null
   - If it stays set, next link action might get confused

---

## What to Include When Reporting Issues

When something goes wrong, copy-paste these logs:

1. **LINK-BUTTON section** - Shows which activity you clicked link on
2. **LINK-HANDLER section** (entire block with === separators) - Shows complete linking logic
3. **Any SUBMIT-ACTIVITY logs that follow** - Shows if activity creation was triggered
4. **Your expected vs actual results** - What should have happened vs what did

This will help pinpoint exactly where the logic breaks down.
