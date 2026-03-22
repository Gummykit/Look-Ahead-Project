# Child Activity Not Moving Visually - Comprehensive Analysis

## Problem Statement (Clarified)

**Visual Symptom**: When dragging parent Activity A:
- ✅ Grandchild (Activity C) moves to correct new position
- ❌ Child (Activity B) stays at old position  
- ✅ Parent (Activity A) moves to correct new position

**This is unusual** because it suggests:
- Grandchild data IS being updated (it moves)
- Child data MIGHT be updating (need to verify)
- But child is rendering at OLD position

## Investigation Plan

### Phase 1: Verify Data Update
Check if child's `startDate` actually changes in the state:

**Test**: After dragging parent 5 days, check browser storage:
```javascript
// In console:
const data = JSON.parse(localStorage.getItem('timechart_data'));
const parent = data.activities.find(a => a.name === 'Activity A');
const child = data.activities.find(a => a.name === 'Activity B');
const grandchild = data.activities.find(a => a.name === 'Activity C');

console.log('Parent A startDate:', parent.startDate);
console.log('Child B startDate:', child.startDate);
console.log('Grandchild C startDate:', grandchild.startDate);
```

**Expected**: All three should have moved 5 days forward

### Phase 2: Verify Rendering
If data IS correct but child doesn't move visually:

**Watch for logs**:
```
🎨 [RenderChild] Rendering child activity: {
  childName: "Activity B",
  startDate: Wed Feb 23 2026,   ← Check this
  linkedStartDay: 13
}
```

If this shows NEW date but timechart shows OLD position:
- **Bug is in: `renderDateCells()` or grid positioning**

If this shows OLD date:
- **Bug is in: Component not re-rendering with new data**

## Enhanced Logging Architecture

### Log Color Guide
```
🔵 = Drag operation logs (component)
🟢 = Update handler logs (editor.tsx)
🟠 = Warning/fallback detection
🔴 = Error conditions
🎨 = Rendering/visual logs
🔍 = Descendant search logs
```

### Critical Logs for This Bug

1. **"Activity A data updated"**
   ```
   🟢 [Update] Activity map - parent updated: {
     id: "A-ID",
     newStart: Wed Feb 15 2026    ← 5 days later
   }
   ```

2. **"Activity B data updated"**
   ```
   🟢 [Update] Activity map - child updated: {
     id: "B-ID",
     newStart: Wed Feb 23 2026    ← 5 days later
   }
   ```

3. **"Activity B rendering with NEW date"**
   ```
   🎨 [RenderChild] Rendering child activity: {
     childName: "Activity B",
     startDate: Wed Feb 23 2026   ← Should be new
     linkedStartDay: 13           ← Position on grid
   }
   ```

## Suspected Root Causes (Ranked by Likelihood)

### Cause 1: Child Update NOT Applied ⭐ Most Likely
**Symptom**: `🟢 [Update] Activity map - child updated:` log is MISSING

**Fix Location**: `editor.tsx` line ~315-325
```typescript
// This code finds and updates children:
const childUpdate = childUpdates.find((cu: any) => cu.childId === a.id);
if (childUpdate) {
  const updated = { ...a, ...childUpdate.updates };
  // Child should be updated here
}
```

**Why it might fail**:
- `childId` doesn't match any activity ID
- `childUpdates` array is empty
- Activity array doesn't contain the child

### Cause 2: Child Re-render Not Triggered
**Symptom**: `🎨 [RenderChild]` logs show OLD date after state update

**Fix Location**: `UnifiedTimeChartEditor.tsx` line ~2160
```typescript
const memoizedActivityRows = useMemo(() => renderActivityRows(), 
  [timechart.activities, ...]  // This triggers re-render
);
```

**Why it might fail**:
- `timechart.activities` not in dependencies
- memoization preventing re-render
- Component not receiving updated props

### Cause 3: Grandchild Update Overwrites Child
**Symptom**: Child updates applied, but then grandchild overwrites it

**Why it might fail**:
- Multiple state updates racing
- Batch update order issue

### Cause 4: Child Data Correct but Rendering Bug
**Symptom**: Logs show correct dates but timechart wrong position

**Fix Location**: `renderDateCells()` function
- Check if `linkedStartDay` calculation is correct
- Check if visual rendering uses correct offset

## Testing Timeline

### T-0 to T-5min: Create and Link
1. Create Activity A: Feb 10-16
2. Create Activity B: Feb 10-18  
3. Create Activity C: Feb 10-20
4. Link B to A (offset +2): B → Feb 18-26
5. Link C to B (offset +1): C → Feb 27-onwards

### T-5 to T-10min: Initial State Check
- Verify all three visible on timechart
- Open console, clear logs
- Take screenshot of positions

### T-10 to T-15min: Drag and Observe
- Drag A five days right (Feb 10 → Feb 15)
- Watch visual feedback during drag
- On release, watch console logs
- Note: Does B move? Does C move?

### T-15 to T-25min: Log Analysis
- Identify which logs appear/disappear
- Check if B has `Activity map - child updated`
- Check if B has `🎨 [RenderChild]` with new date
- Take screenshot of final positions

## What To Report

When testing, please provide:

1. **Console logs** (copy full output):
   - Start: First drag log
   - End: Last render log

2. **Visual evidence**:
   - Where does B end up after drag?
   - What's the offset (days moved)?

3. **Key log findings**:
   - Does "child updated" log appear for B?
   - Does "RenderChild" log appear for B?
   - What date does RenderChild show?

4. **Comparative positions**:
   - Parent A: Old position → New position
   - Child B: Old position → New position (or NOT?)
   - Grandchild C: Old position → New position

## Success Indicators

✅ **Child moves correctly when**:
```
1. All logs appear in sequence
2. "Child updated" log shows new date for B
3. "RenderChild" log shows new date for B  
4. Timechart shows B at new position (5 days right)
5. B and A moved by same offset
```

❌ **Child fails to move when**:
```
1. "Child updated" log missing for B, OR
2. "RenderChild" log missing for B, OR
3. "RenderChild" shows OLD date for B, OR
4. Timechart shows B at old position
```

## Implementation Status

### Code Changes Made ✅
- Component now searches for children by `parentActivityId` (fallback method)
- Handler now has 4 detection paths for finding children
- Enhanced logging at every phase
- Detailed comments explaining the flow

### Code NOT Changed Yet (Awaiting Test Results)
- `renderDateCells()` implementation
- memoization dependencies
- Batch update order

## Next Actions

1. **Run the test protocol** from `CHILD_DRAG_TEST_PROTOCOL.md`
2. **Capture console logs** during drag
3. **Report which phase fails** (Phase 1-5 from debug guide)
4. **I will then fix the specific issue** based on your findings

The comprehensive logging will pinpoint EXACTLY where the bug is!
