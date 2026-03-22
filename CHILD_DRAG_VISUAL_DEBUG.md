# Comprehensive Debug Guide: Child Activity Not Moving on Timechart

## Critical Distinction

**⚠️ IMPORTANT**: We're NOT just checking if data updates. We need to verify:
1. ✅ Data updates in state (logs show new dates)
2. ✅ Data persists correctly (localStorage has new dates)
3. ✅ **Timechart UI re-renders with new dates** ← This is what's failing!

## The Rendering Pipeline

When you drag parent Activity A:

```
1. handleActivityPressOut() in component
   ↓
2. Calculates childUpdates for all descendants
   ↓
3. Calls onUpdateActivity(id, {childUpdates: [...]})
   ↓
4. handleUpdateActivity() in editor.tsx
   ├─ Receives childUpdates
   ├─ Maps activities array
   ├─ Updates parent + children with new dates
   ├─ Returns new timechart state
   ↓
5. setTimechart(newState) triggers re-render
   ↓
6. Component re-renders with new timechart.activities
   ↓
7. renderActivityRows() called
   ├─ linkedActivityRows filtered
   ├─ linkedStartDay = getDaysBetween(timechart.startDate, linkedActivity.startDate)
   ├─ renderDateCells(linkedActivity, linkedStartDay) called
   ↓
8. Child activity should display at NEW position on timechart
   
IF STUCK HERE: Child activity renders at OLD position
```

## Step-by-Step Test & Debug

### TEST PHASE 1: Verify Component Detects Child

**What to do**:
1. Create Activity A (Feb 10-16)
2. Create Activity B (Feb 10-18)
3. Link B to A (B becomes child, offset +2)
4. Open Console
5. **Drag Activity A 5 days to the right**
6. Check console for:

```
🔵 [Drag] Activity press out: {
  activityId: "A-ID",
  childActivityIds: [...]  // Should have B-ID or be empty
  childrenByParentId: ["B-ID"],  // Should find B
  usingDirectChildIds: ["B-ID"]  // Should use this
}

🔵 [Drag] Updating 1 descendants with offset 5 - descendantIds: ["B-ID"]
```

**If you see this**: ✅ Component correctly found the child
**If you DON'T see this**: ❌ Component didn't detect child - check linking

---

### TEST PHASE 2: Verify Handler Receives childUpdates

Still from previous drag, check for:

```
🟢 [Update] Using passed childUpdates: 1 children
```

**If you see this**: ✅ Handler received childUpdates array
**If you DON'T see this**: ❌ childUpdates not passed - component issue

---

### TEST PHASE 3: Verify Child Update Gets Applied

Still from previous drag, check for:

```
🟢 [Update] Activity map - child updated: {
  id: "B-ID",
  name: "Activity B",
  oldStart: 2026-02-18,      // Original date
  oldEnd: 2026-02-26,
  newStart: 2026-02-23,      // Should be 5 days later
  newEnd: 2026-03-03,
  parentActivityId: "A-ID"
}

🟠 [Update] Child updates to be applied: [
  {
    childId: "B-ID",
    newStart: Wed Feb 23 2026,   // New date
    newEnd: Wed Mar 03 2026
  }
]
```

**If you see this**: ✅ Update was calculated and applied
**If you DON'T see this**: ❌ Update calculation failed - handler issue

---

### TEST PHASE 4: Verify Updated Data in State

Still from previous drag, check for:

```
🟢 [Update] Updated timechart activities: [
  {
    id: "A-ID",
    name: "Activity A",
    startDate: Wed Feb 15 2026,    // Should be 5 days later
    endDate: Wed Feb 21 2026,
    parentActivityId: null
  },
  {
    id: "B-ID",
    name: "Activity B",
    startDate: Wed Feb 23 2026,    // Should be 5 days later
    endDate: Wed Mar 03 2026,
    parentActivityId: "A-ID"
  }
]
```

**If you see this**: ✅ Data correctly updated in state
**If child dates are same as old**: ❌ Update didn't apply to child

---

### TEST PHASE 5: Verify Timechart Re-renders

After the drag completes:

1. Check console for:
```
🟣 [Render] Found 1 linked activities for group: {
  groupKey: "Activity A-contractor",
  parentIds: ["A-ID"],
  linkedActivities: [{
    id: "B-ID",
    name: "Activity B",
    parentId: "A-ID"
  }]
}

🟢 [Render] Full linked activity object: {
  id: "B-ID",
  name: "Activity B",
  startDate: Wed Feb 23 2026,    // Should be NEW date here
  endDate: Wed Mar 03 2026,
  parentActivityId: "A-ID"
}
```

**If startDate is Feb 23**: ✅ Component received updated data
**If startDate is Feb 18**: ❌ Component didn't re-render with new data

---

### TEST PHASE 6: Check Actual Timechart Position

After seeing all logs match new dates:

1. **Visually check the timechart**
   - Where is Activity B rendering?
   - Is it still in its OLD position (Feb 18)?
   - Or moved to NEW position (Feb 23)?

If data shows Feb 23 but timechart shows Feb 18:
- This is a **rendering bug** in `renderDateCells()`

---

## Decision Tree

```
START: Drag parent, check if child moves

├─ [Phase 1] Component detects child?
│  ├─ NO → "Component not finding child via parentActivityId"
│  │       Action: Check linking logic
│  │
│  └─ YES ↓
│
├─ [Phase 2] Handler receives childUpdates?
│  ├─ NO → "Component not passing childUpdates"
│  │       Action: Check handleActivityPressOut
│  │
│  └─ YES ↓
│
├─ [Phase 3] Child update calculated and applied?
│  ├─ NO → "Handler not processing childUpdates"
│  │       Action: Check childUpdates application logic
│  │
│  └─ YES ↓
│
├─ [Phase 4] Updated dates in state?
│  ├─ NO → "Handler not updating state correctly"
│  │       Action: Check map/spread logic
│  │
│  └─ YES ↓
│
├─ [Phase 5] Component received new dates?
│  ├─ NO → "Component not re-rendering"
│  │       Action: Check useMemo dependencies
│  │
│  └─ YES ↓
│
├─ [Phase 6] Timechart visually updated?
│  ├─ NO → "renderDateCells() using old dates"
│  │       Action: Check linkedStartDay calculation
│  │
│  └─ YES → ✅ BUG FIXED!
```

## What to Report

When testing, please provide:

1. **Logs from Phase 1**: Is child detected?
2. **Logs from Phase 2-5**: Where does it fail?
3. **Phase 6 observation**: Does timechart show old or new position?
4. **Exact dates**:
   - Parent old position: _______
   - Parent new position: _______
   - Child old position (visual): _______
   - Child new position (visual): _______
   - Child's startDate in logs: _______

## Expected Success Scenario

When all is working:
- Drag parent from Feb 10 → Feb 15 (5 days)
- Child moves from Feb 18 → Feb 23 (also 5 days)
- Both move by same offset on visual timechart ✅

## Critical Code Locations to Check If Stuck

1. **Component Pass childUpdates**:
   - File: `UnifiedTimeChartEditor.tsx`
   - Line: ~1310
   - Should have: `childUpdates: childUpdatesData`

2. **Handler Receive childUpdates**:
   - File: `editor.tsx`
   - Line: ~254
   - Should have: `childUpdates = updatedActivity.childUpdates`

3. **Handler Apply Updates**:
   - File: `editor.tsx`
   - Line: ~315-325
   - Should find and update child in activities array

4. **Component Re-render**:
   - File: `UnifiedTimeChartEditor.tsx`
   - Line: ~2160
   - Dependency includes: `timechart.activities`

5. **Render Child Position**:
   - File: `UnifiedTimeChartEditor.tsx`
   - Line: ~2065
   - Should calculate: `linkedStartDay = getDaysBetween(..., linkedActivity.startDate)`
