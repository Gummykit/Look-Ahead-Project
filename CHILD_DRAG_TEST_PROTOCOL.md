# Child Activity Drag-and-Drop Debug Session Setup

## Current Status

**Problem**: Child activity **data updates** (dates change in state) but **does NOT move visually** on the timechart.

**Root Cause Analysis**: The issue is NOT in data updates - it's in the **rendering pipeline**. We need to trace where the visual update breaks.

## Enhanced Debug Logging Added

### Location 1: State Handler (editor.tsx)
**Lines**: ~315-340

Added detailed logging when child updates are applied:
```
🟠 [Update] Child updates to be applied: [
  {childId: "B-ID", newStart: Date, newEnd: Date}
]

🔴 [Update] WARNING: These child updates were NOT applied: [...]
```

This tells us if the child actually got updated in the state.

### Location 2: Component Render (UnifiedTimeChartEditor.tsx)
**Lines**: ~2063-2077

Added logging when rendering child activity:
```
🎨 [RenderChild] Rendering child activity: {
  childId: "B-ID",
  childName: "Activity B",
  startDate: Wed Feb 23 2026,      // Should be NEW date
  linkedStartDay: 13,               // Position on grid
  timechartStartDate: Wed Feb 10 2026,
  parentActivityId: "A-ID"
}
```

This tells us what dates the component is using when rendering.

## Testing Protocol

### Step 1: Create Hierarchy
1. Create Activity A (Feb 10-16)
2. Create Activity B (Feb 10-18) - independent
3. Link B to A (offset +2 days)
   - Expected: B becomes child of A
   - Expected: B moves to Feb 18-26 (because A ends Feb 16)

### Step 2: Prepare for Drag
1. Verify both activities visible on timechart
2. Open Browser DevTools Console
3. Verify logs show child detected

### Step 3: Perform Drag
1. **Drag Activity A 5 days to the right** (Feb 10 → Feb 15)
2. **Do NOT release yet** - watch visual feedback
3. **Release the drag**

### Step 4: Watch Console Output

**Expected sequence of logs**:

```
[At release]:
🔵 [Drag] Activity press out: {
  activityId: "A-ID",
  childrenByParentId: ["B-ID"],     ← Child found
  usingDirectChildIds: ["B-ID"]
}

🔵 [Drag] Updating 1 descendants with offset 5 - descendantIds: ["B-ID"]

[In handler]:
🟢 [Update] Activity update received: {...}

🟢 [Update] Using passed childUpdates: 1 children

🟠 [Update] Child updates to be applied: [
  {childId: "B-ID", newStart: Wed Feb 23 2026}  ← NEW date
]

🟢 [Update] Activity map - child updated: {
  id: "B-ID",
  newStart: Wed Feb 23 2026     ← Updated in state
}

🟢 [Update] Updated timechart activities: [
  {id: "B-ID", startDate: Wed Feb 23 2026}   ← State updated
]

[Component re-renders]:
🎨 [RenderChild] Rendering child activity: {
  childName: "Activity B",
  startDate: Wed Feb 23 2026      ← Component has new date
  linkedStartDay: 13              ← New grid position
}
```

### Step 5: Check Visual Result

After all logs above:
- **Look at the timechart**
- Activity B should be at new position (Feb 23)
- Activity B should move 5 days right (same as parent)

## What Each Log Tells Us

| Log | What It Means |
|-----|---------------|
| `🔵 [Drag] childrenByParentId: ["B-ID"]` | ✅ Component found child |
| `🟢 [Update] Using passed childUpdates: 1` | ✅ Handler received childUpdates |
| `🟠 [Update] Child updates to be applied:` | ✅ Update data prepared |
| `🟢 [Update] Activity map - child updated:` | ✅ Child in activities array updated |
| `🎨 [RenderChild] startDate: Wed Feb 23` | ✅ Component has new date |
| Timechart shows child at OLD position | ❌ **Rendering bug in renderDateCells()** |

## If Child Doesn't Move Visually

### Scenario A: Logs stop at Phase 2-3
**"Child updates not calculated"**
- Fix: Check `handleActivityPressOut()` in component
- Verify: `directChildIds` calculation
- Verify: `findAllDescendants()` function

### Scenario B: All logs correct but visual wrong
**"State updated but component not using new data"**
- Fix: Check `useMemo()` dependencies
- Verify: `timechart.activities` in dependency array
- Verify: Component re-renders after state update

### Scenario C: RenderChild logs show old date
**"Component didn't re-render with new data"**
- Fix: Check if `setTimechart()` actually triggered re-render
- Verify: React DevTools shows timechart updated
- Check: No memoization preventing re-render

### Scenario D: RenderChild logs show new date but timechart wrong
**"renderDateCells() or drag visualization bug"**
- Fix: Check `renderDateCells()` implementation
- Verify: `linkedStartDay` calculation is correct
- Check: `DAY_WIDTH` constant is consistent

## Console Filter Tips

To see only drag-related logs:
```javascript
// In console, filter by:
- Type "child" to filter for child-related logs
- Type "Render" to see render phase logs
- Type "🔵" to see drag logs
- Type "🟢" to see handler logs
- Type "🎨" to see render logs
```

## Success Criteria

✅ **Drag Complete When**:
1. All 4 logs appear (Drag → Handler → Render → Child)
2. `RenderChild` shows NEW date for child
3. Timechart visually shows child at NEW position
4. Both parent and child move by same offset

❌ **Failure Point When**:
1. Any phase missing from logs
2. `RenderChild` shows OLD date
3. Timechart shows child at OLD position
4. Only parent moves, child stays

## Next Steps After Testing

1. **Copy console output** - paste full logs
2. **Take screenshot** of timechart showing positions
3. **Identify which scenario applies** (A, B, C, or D)
4. **Report exact log sequence** that stops working
5. **Provide visual evidence** of where child is positioned

With this information, the exact bug location can be pinpointed!
