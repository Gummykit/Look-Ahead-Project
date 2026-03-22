# Latest Debug Results

## Key Finding

The `parentActivityId` field is being **correctly merged** into Activity Y:
- ✅ Sent in sourceUpdates: `parentActivityId: "yexhtr855"`
- ✅ Received in handler: `parentActivityId: "yexhtr855"`
- ✅ Merged correctly: `parentActivityId: "yexhtr855"`
- ✅ Stored in first setTimechart call

BUT then when Activity X (target) is updated with `childActivityIds`, something is resetting Activity Y's `parentActivityId` back to `undefined`.

## Root Cause

The issue is **double state updates in quick succession**:

1. **First onUpdateActivity call** (for Activity Y):
   - Updates Activity Y with `parentActivityId: "yexhtr855"` ✅
   - Calls `setTimechart([Activity X, Activity Y with parent])`

2. **Second onUpdateActivity call** (for Activity X):
   - Updates Activity X with `childActivityIds: ["4sb40pplj"]`
   - Calls `setTimechart([Activity X with children, Activity Y WITHOUT parent])`
   - **PROBLEM**: The second call overwrites the first update!

## The Fix Needed

When `handleLinkActivities()` calls `onUpdateActivity` twice in quick succession:
```typescript
onUpdateActivity(linkingSourceActivityId, sourceUpdates);  // Update Y
onUpdateActivity(selectedLinkTargetActivityId, {...});    // Update X
```

Both updates need to be **batched together** OR the second update needs to read from the current state (which may not be updated yet due to async setState).

## Solution

Either:
1. Use `onBatchUpdateActivities` to update both at once, OR
2. Make the second update aware of the first update's changes, OR
3. Add a small delay between updates (not ideal), OR
4. Combine both updates into a single state change

Best approach: **Use onBatchUpdateActivities** to send both updates at once!
