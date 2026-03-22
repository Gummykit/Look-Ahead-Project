# Debug Guide: Child Activity Not Moving with Parent

## Comprehensive Debug Logging Added

Enhanced `handleUpdateActivity()` in `app/editor.tsx` with multiple fallback paths to find children:

### Four Detection Paths (in order):

1. **Path A (childUpdates passed)** - Drag operation
   ```
   ✅ Best case - drag handler passes calculated childUpdates
   🟢 [Update] Using passed childUpdates: X children
   ```

2. **Path B (childActivityIds non-empty)** - Has childActivityIds array
   ```
   ✅ Good case - activity has childActivityIds field populated
   🔵 [Update] childActivityIds exists on activity: [...]
   🔍 [Descendants] Looking for children of X → found Y children
   ```

3. **Path C (childActivityIds empty but children exist)** - Empty array but children found
   ```
   ⚠️ Warning case - childActivityIds exists but is empty []
   🟠 [Update] childActivityIds is empty on activity, searching by parentActivityId instead
   ```

4. **Path D (no childActivityIds property)** - No array at all
   ```
   ❌ Problem case - childActivityIds doesn't exist
   🟡 [Update] No childActivityIds property! Found X children via parentActivityId search
   ```

## Test Steps

### Test 1: Verify Child is Being Created with Correct parentActivityId

1. Create Activity A (Feb 10-16)
2. Create Activity B (Feb 10-18)
3. **Link B to A** with offset +2 days
4. **Check logs** for:
   ```
   🟢 [LINK-HANDLER] Batch update completed for SOURCE and TARGET activities
   ```
5. **Check console** for Activity B's parentActivityId:
   ```javascript
   // Open DevTools and run:
   JSON.parse(localStorage.getItem('timechart_data')).activities
     .find(a => a.name === 'Activity B')
   // Should show: parentActivityId: "A's-ID"
   ```

### Test 2: Drag Parent and Watch for Child Update Detection

1. **From Test 1**, now drag Activity A to new date
2. **Watch for drag logs**:
   ```
   🔵 [Drag] Updating X descendants with offset Y
   ```
3. **Watch for update detection logs**:
   ```
   🟢 [Update] Using passed childUpdates: 1 children
   // OR one of the fallback paths:
   🔵 [Update] childActivityIds exists on activity: [...]
   🟠 [Update] childActivityIds is empty on activity...
   🟡 [Update] No childActivityIds property! Found...
   ```

4. **Identify which path is being used** - This tells us the problem:
   - If **Path A**: childUpdates passed but not processed correctly
   - If **Path B**: Normal case, working
   - If **Path C/D**: childActivityIds not being maintained correctly

### Test 3: Check Parent Activity Structure

1. Create and link activities as in Test 1
2. Run in console:
   ```javascript
   const activities = JSON.parse(localStorage.getItem('timechart_data')).activities;
   const parent = activities.find(a => a.name === 'Activity A');
   const child = activities.find(a => a.name === 'Activity B');
   
   console.log('Parent A:');
   console.log('  - id:', parent.id);
   console.log('  - childActivityIds:', parent.childActivityIds);
   console.log('');
   console.log('Child B:');
   console.log('  - id:', child.id);
   console.log('  - parentActivityId:', child.parentActivityId);
   ```

3. **Expected output**:
   ```
   Parent A:
     - id: "abc123"
     - childActivityIds: ["def456"]
   
   Child B:
     - id: "def456"
     - parentActivityId: "abc123"
   ```

4. **If childActivityIds is undefined/null**: This is the problem!

### Test 4: Watch Ancestor Search Algorithm

When you drag, look for logs like:
```
🔍 [Descendants] Looking for children of abc123 → found 1 children: [{id: "def456", name: "Activity B"}]
```

If you see:
```
🔍 [Descendants] Looking for children of abc123 → found 0 children: []
```

This means `parentActivityId` is NOT being set correctly on the child activity.

## Expected Console Output for Successful Drag

When dragging Activity A with child Activity B:

```
🔵 [Update] Activity update received: {
  id: "abc123",
  originalStartDate: 2026-02-10,
  newStartDate: 2026-02-15,
  isParent: true,
  childActivityIds: ["def456"],
  hasChildUpdates: true
}

🔵 [Update] Date changes detected: {
  startDateChanged: true,
  endDateChanged: true,
  oldStart: "2026-02-10",
  newStart: "2026-02-15"
}

🟢 [Update] Using passed childUpdates: 1 children

🟢 [Update] Activity map - parent updated: {
  id: "abc123",
  oldStart: 2026-02-10,
  newStart: 2026-02-15,
  parentActivityId: null
}

🟢 [Update] Activity map - child updated: {
  id: "def456",
  oldStart: 2026-02-18,
  newStart: 2026-02-23
}

🟢 [Update] Updated timechart activities: [
  {id: "abc123", name: "Activity A", startDate: 2026-02-15, parentActivityId: null},
  {id: "def456", name: "Activity B", startDate: 2026-02-23, parentActivityId: "abc123"}
]
```

## Potential Issues & Fixes

### Issue 1: childActivityIds Not Maintained During Linking
**Symptom**: Path D logs appear (no childActivityIds property)

**Check**: Is the linking code properly adding to `childActivityIds`?
- Location: `UnifiedTimeChartEditor.tsx` line 1060-1065
- Should have: `const updatedChildIds = targetActivity.childActivityIds ? [...targetActivity.childActivityIds] : [];`

### Issue 2: childActivityIds Gets Cleared on Parent Update
**Symptom**: Path C logs appear (empty array)

**Check**: Is `childActivityIds` being preserved in state updates?
- Location: `handleUpdateActivity()` must not overwrite with empty array
- Should spread existing: `...a` preserves all fields

### Issue 3: parentActivityId Not Set on Child
**Symptom**: Descendants algorithm finds 0 children

**Check**: When linking, is parentActivityId being set on source?
- Location: `UnifiedTimeChartEditor.tsx` line 1051
- Should have: `parentActivityId: targetActivity.id`

## What to Report

When testing, please provide:

1. **Console logs** during linking: Copy the entire 🟢 [LINK-HANDLER] section
2. **Console logs** during drag: Copy the 🔵 [Drag] and 🟢 [Update] sections
3. **Storage check** result: Output of the localStorage queries above
4. **Which path is triggered**: A, B, C, or D based on log color/emoji

This information will pinpoint exactly where the issue is!
