# 🔗 Auto Activity Linking - Debugging Guide

## Issue: Prompt Not Showing Despite Adjacent Activities

If you're not seeing the "Link Activities?" prompt even though activities are positioned next to each other, follow this debugging guide.

---

## Step 1: Open Browser Console

### For Web:
- Press `F12` to open Developer Tools
- Go to the **Console** tab

### For Mobile:
- iOS: Use Safari Web Inspector
- Android: Use Chrome DevTools with `adb logcat`
- Expo: Shake phone → Open Debugger

---

## Step 2: Reproduce the Issue

1. **Create Activity A** - e.g., "Excavation", Floor 1, May 1-5
2. **Create Activity B** - e.g., "Framing", Floor 1
3. **Drag Activity B** to start on **May 5** (same day Activity A ends)
4. **Release drag**

---

## Step 3: Check Console Logs

Look for these logs in order:

### Expected Log Sequence

```
🔵 [Drag] handleActivityPressOut() called
```
**If missing**: The drag release handler isn't being called. Check:
- Are you dragging the activity correctly? (long press)
- Are you releasing on a valid date?
- Is the activity drag-enabled?

---

### Next Expected Log

```
🔵 [Drag] Activity press out: {
  activityId: "...",
  childActivityIds: [...],
  childrenByParentId: [...],
  usingDirectChildIds: [...]
}
```
**If missing**: Something went wrong early in the handler.

---

### Critical Log

```
🔗 [Auto-Link] Activity has NO children, proceeding with auto-linking detection
```

**If you see this**: ✅ Good! Auto-linking detection is active

**If you see instead**:
```
🔗 [Auto-Link] SKIPPED - Activity is parent with children, auto-linking not checked
```

**Problem**: The activity being dragged is being treated as a parent activity. This means:
- The activity has children linked to it already
- The system thinks it's a parent, so it goes into parent handling mode
- Auto-linking detection is skipped

---

## Step 4: Analyze the Detection Logs

Look for:

```
🔗 [Auto-Link] Starting detection: {
  draggedActivityId: "act-123",
  draggedActivityFloor: "floor-1",
  dragActivityStartDate: "2026-05-05",
  activityParentId: null,
}
```

### Check Each Field:

**draggedActivityFloor**: 
- Should be "floor-1" or similar
- If `undefined` → Floor ID not set on activity

**dragActivityStartDate**: 
- Should be a valid date string
- Should match the date you dragged it to
- If wrong → Drag position wasn't updated correctly

**activityParentId**: 
- Should be `null` or `undefined`
- If it has a value → Activity already linked to another parent

---

## Step 5: Check Activities on Same Floor

```
🔗 [Auto-Link] Activities on same floor: {
  count: 2,
  activities: [
    { id: "...", name: "Excavation", endDate: "2026-05-05", floor: "floor-1" },
    { id: "...", name: "Other", endDate: "2026-05-10", floor: "floor-1" }
  ]
}
```

**What to check**:

✅ **count**: Should be > 0 (should find at least 1 other activity)

❌ **If count is 0**: 
- No other activities on same floor
- Solution: Create Activity A first on the same floor

❌ **Activities list is empty**:
- Activities exist but floor doesn't match
- Check Activity A's `floorLevelId` matches Activity B's

---

## Step 6: Check Date Comparison Logs

```
🔗 [Auto-Link] Comparing: "Excavation" ends Fri May 05 2026 vs drags starts Fri May 05 2026
🔗 [Auto-Link] Comparing: "Other" ends Fri May 10 2026 vs drags starts Fri May 05 2026
```

**What to look for**:

✅ **Exact match**: Both show the same date → Potential parent found
❌ **Different dates**: "Fri May 05 2026" ≠ "Sat May 06 2026" → Not adjacent

**If dates don't match**:
- Activity A actually ends on a different day
- Activity B actually starts on a different day
- Solution: Check your calendar, drag to the correct day

---

## Step 7: Check Final Decision

```
🔗 [Auto-Link] Detection result: {
  potentialParentFound: true,
  potentialParentName: "Excavation",
  activityHasParent: false,
  shouldShowPrompt: true,
}
```

### Analyze:

| Field | Good Value | Bad Value | Fix |
|-------|-----------|-----------|-----|
| potentialParentFound | `true` | `false` | Check dates match exactly |
| potentialParentName | Activity name | `undefined` | Activity A doesn't exist |
| activityHasParent | `false` | `true` | Activity B already linked to something else |
| shouldShowPrompt | `true` | `false` | All conditions not met |

---

## Common Issues & Solutions

### Issue 1: "SKIPPED - Activity is parent with children"

**Cause**: You're dragging an activity that already has children linked to it.

**Solution**:
1. Create a fresh activity with no children
2. Drag that activity to be adjacent to another
3. The prompt should appear

**Test**: Create Activity A, Activity B, Activity C. Drag C next to A (no children). Should see prompt.

---

### Issue 2: "Activities on same floor: count 0"

**Cause**: Activity A is on a different floor than Activity B.

**Solution**:
1. Check Activity A's floor assignment
2. Check Activity B's floor assignment  
3. Make sure they're both on the **same floor**
4. Redrag Activity B next to Activity A

**Test**: Both in same floor selector before dragging.

---

### Issue 3: Dates don't match in comparison logs

**Cause**: You didn't drag to the exact day after.

**Example**:
```
"Excavation" ends Fri May 05 2026
"Framing" starts Sat May 06 2026  ← Next day, NOT same day
```

**Solution**: 
1. Drag Activity B to start on **May 5** (same day Activity A ends)
2. Not May 6, not May 7 - same day

**Why same day?** Because the code checks:
```typescript
endDate.toDateString() === startDate.toDateString()
// Both should be "Fri May 05 2026"
```

---

### Issue 4: potentialParentFound is false but dates look the same

**Cause**: Date comparison issue or timezone issue.

**Solution**: Check console output more carefully. Look for the comparison log:
```
🔗 [Auto-Link] Comparing: "Excavation" ends Fri May 05 2026 vs drags starts Fri May 05 2026
```

If you see this with same dates but `potentialParentFound: false`, there's a bug. Report it with the console output.

---

### Issue 5: shouldShowPrompt is false even though potentialParentFound is true

**Cause**: `activityHasParent` is `true` - Activity B already has a parent.

**Solution**:
1. Open Activity B's edit modal
2. Look for a "Linked to: [Parent Name]" field
3. Click unlink (if available)
4. Redrag Activity B next to Activity A
5. Prompt should appear now

---

## Complete Debugging Checklist

- [ ] Dragging works (activity moves on calendar)
- [ ] `handleActivityPressOut()` is called (check console)
- [ ] Activity doesn't have children (no "SKIPPED" message)
- [ ] Both activities on same floor (check floor IDs)
- [ ] No other activity ends on the day this starts
- [ ] Dragged activity has no parent (activityParentId is null)
- [ ] Date comparison shows matching dates
- [ ] shouldShowPrompt is `true`
- [ ] Alert dialog should appear

---

## Advanced Debugging

### Enable Extra Verbose Logging

Add this at the top of your console to see ALL logs:

```javascript
// Shows all 🔗 logs
console.log(localStorage.getItem('DEBUG_AUTO_LINK'));
```

### Check Activity Data

In browser console, run:

```javascript
// This depends on your app structure, but typically:
// Replace TIMECHART_DATA with your actual store/context
// Example for React state inspection

// For activities with specific IDs:
window.__DEBUG_ACTIVITIES__ = timechartData.activities;
window.__DEBUG_ACTIVITIES__.forEach(a => {
  console.log(`${a.name}: Floor=${a.floorLevelId}, Parent=${a.parentActivityId}, Dates=${a.startDate} to ${a.endDate}`);
});
```

### Monitor Network Activity

If using a backend API:
1. Open Network tab
2. Filter for activity update requests
3. Check if the activity update is being sent
4. Verify response is successful

---

## Still Not Working?

Provide this information:

1. **Console Output**: Copy ALL logs with 🔗 prefix
2. **Activity Details**: 
   - Activity A name, floor, dates
   - Activity B name, floor, dates
3. **Drag Position**: Exactly where you dragged to
4. **Expected Behavior**: What you expected to happen
5. **Actual Behavior**: What actually happened

---

## Known Issue: Alert Not Showing (FIXED)

### Symptom
You see these logs:
```
🔗 [Auto-Link] Detected activity positioned right after another activity
```
But the prompt dialog doesn't appear on screen.

### Root Cause
The Alert was being triggered before React finished rendering state updates, causing it to be dismissed or not visible.

### Solution Applied
Added a 100ms timeout to allow state updates to settle before showing the Alert:
```typescript
setTimeout(() => {
  Alert.alert(...);
}, 100);
```

### What Changed
**Before**: Alert shown immediately
**After**: Alert shown after 100ms delay

This gives React time to:
1. Update activity state
2. Re-render the component
3. Settle the UI
4. Display the Alert on top

### Status
✅ **Fixed in latest version** - If you're still not seeing the prompt, clear your app cache and reload.

---

## Quick Test Script

If you have access to the component, use this test:

```javascript
// Test date comparison
const date1 = new Date("2026-05-05");
const date2 = new Date("2026-05-05");
console.log(date1.toDateString() === date2.toDateString()); // Should be true

// Test with your actual dates
const actDate = new Date(/* Activity A endDate */);
const dragDate = new Date(/* Activity B startDate after drag */);
console.log(`${actDate.toDateString()} === ${dragDate.toDateString()}`);
```

---

## Summary

**To get the prompt to appear**:
1. ✅ Drag an activity without children
2. ✅ Position it to start on the same day another activity ends
3. ✅ Both activities on same floor
4. ✅ Dragged activity has no parent
5. ✅ Release drag

If any of these aren't true, the prompt won't appear. Check the console logs to see which condition is failing.

