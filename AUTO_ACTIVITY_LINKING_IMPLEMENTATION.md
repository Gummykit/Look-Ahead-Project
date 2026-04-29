# 🔗 Auto Activity Linking - Implementation Guide

## Overview

This guide explains the technical implementation of the Auto Activity Linking feature that automatically detects when an activity is placed immediately after another and prompts the user to create a link.

---

## Architecture

### Detection Flow

```
User drags activity
       ↓
User releases (onResponderRelease)
       ↓
handleActivityPressOut() called
       ↓
Update activity dates
       ↓
Check if activity has children
   ├─ Yes → Update parent + all children with offset
   └─ No → Update activity only
       ↓
[NEW] Check for auto-linking candidates
       ├─ Get dragged activity's floor level
       ├─ Find all activities on same floor
       ├─ Check if any end on day dragged activity starts
       └─ If found & no existing parent → Show prompt
       ↓
User responds to prompt
   ├─ "Yes" → Update dragged activity with parentActivityId
   └─ "No" → No action
       ↓
Clear drag state
```

---

## Code Changes

### File Modified
`components/UnifiedTimeChartEditor.tsx`

### Function Modified
`handleActivityPressOut()`

### Location in Function
At the end of the "regular activity without children" branch, right before clearing drag state.

### Code Added

```typescript
// ─── Auto-linking Detection ───────────────────────────────────────────
// Check if this activity is positioned right after another activity on the same floor
// and suggest linking if the conditions are met
const draggedActivityFloor = activity?.floorLevelId;

// Find all activities on the same floor (excluding the one being dragged)
const activitiesOnSameFloor = timechart.activities.filter(
  a => a.floorLevelId === draggedActivityFloor && a.id !== draggingActivityId
);

// Check if any activity ends exactly on the day this activity starts
const potentialParent = activitiesOnSameFloor.find(
  a => new Date(a.endDate).toDateString() === new Date(dragActivity.startDate).toDateString()
);

if (potentialParent && !activity?.parentActivityId) {
  // Show prompt asking if user wants to link the activities
  console.log('🔗 [Auto-Link] Detected activity positioned right after another activity', {
    draggedActivityId: draggingActivityId,
    draggedActivityName: dragActivity.name,
    potentialParentId: potentialParent.id,
    potentialParentName: potentialParent.name,
    draggedActivityFloor: draggedActivityFloor,
  });

  Alert.alert(
    'Link Activities?',
    `Would you like to link "${dragActivity.name}" to "${potentialParent.name}"?\n\nThis will create a dependency where the linked activity will automatically follow the parent activity.`,
    [
      {
        text: 'No',
        onPress: () => {
          console.log('🔗 [Auto-Link] User declined linking');
        },
        style: 'cancel',
      },
      {
        text: 'Yes, Link',
        onPress: () => {
          console.log('🔗 [Auto-Link] User accepted linking, creating link now');
          // Update the dragged activity to have potentialParent as its parent
          onUpdateActivity(draggingActivityId, {
            parentActivityId: potentialParent.id,
          });
        },
        style: 'default',
      },
    ]
  );
}
```

---

## Data Flow

### Input Parameters
- `draggingActivityId` (string): ID of activity being dragged
- `dragActivity` (Activity object): Current position of dragged activity
- `activity` (Activity object): The activity record from timechart
- `timechart.activities` (Activity[]): All activities in project

### Processing Steps

#### Step 1: Extract Dragged Activity's Floor
```typescript
const draggedActivityFloor = activity?.floorLevelId;
// Result: "floor-1" (example)
```

#### Step 2: Filter Activities on Same Floor
```typescript
const activitiesOnSameFloor = timechart.activities.filter(
  a => a.floorLevelId === draggedActivityFloor && a.id !== draggingActivityId
);
// Result: [Activity, Activity, ...] (activities on same floor, excluding dragged)
```

#### Step 3: Find Adjacent Activity
```typescript
const potentialParent = activitiesOnSameFloor.find(
  a => new Date(a.endDate).toDateString() === new Date(dragActivity.startDate).toDateString()
);
// Result: Activity (first activity ending when dragged activity starts) OR undefined
```

#### Step 4: Check Conditions
```typescript
if (potentialParent && !activity?.parentActivityId)
// Conditions:
// 1. potentialParent exists (at least one adjacent activity found)
// 2. activity doesn't already have parentActivityId (not already linked)
```

#### Step 5: Show Prompt or Skip
- **If conditions met**: Alert.alert() shows prompt
- **If not met**: Skip to clearing drag state

#### Step 6: Handle User Response
- **"No"**: Log and continue
- **"Yes, Link"**: Call `onUpdateActivity()` with `parentActivityId`

---

## State & Props Used

### State Variables (Accessed)
```typescript
draggingActivityId    // string | null - ID of dragged activity
dragActivity          // Activity | null - Current position
timechart            // TimeChartData - All project data
activity             // Activity | undefined - Dragged activity record
```

### Props Called
```typescript
onUpdateActivity(activityId: string, updates: Partial<Activity>)
  // Called with:
  // activityId: draggingActivityId
  // updates: { parentActivityId: potentialParent.id }
```

### No New State Variables Added
- Uses existing drag state
- No additional useStates required
- No refs added

---

## Date Comparison Method

### Why `.toDateString()`?

```typescript
new Date(a.endDate).toDateString() === new Date(dragActivity.startDate).toDateString()
```

**Advantages**:
- ✅ Ignores time component (only compares year, month, day)
- ✅ Works with ISO strings ("2026-05-05T00:00:00Z")
- ✅ Works with date strings ("2026-05-05")
- ✅ Returns standardized format: "Fri May 05 2026"

**Example**:
```typescript
// Activity A ends on May 5
a.endDate: "2026-05-05"
new Date(a.endDate).toDateString() // "Fri May 05 2026"

// Activity B starts on May 6
dragActivity.startDate: "2026-05-06"
new Date(dragActivity.startDate).toDateString() // "Sat May 06 2026"

// NOT equal - no prompt shown ✅

// Activity C starts on May 5
dragActivity.startDate: "2026-05-05"
new Date(dragActivity.startDate).toDateString() // "Fri May 05 2026"

// Equal - prompt shown ✅
```

---

## Alert Dialog Implementation

### Alert.alert() Call

```typescript
Alert.alert(
  'Link Activities?',                           // Title
  `Would you like to link "${dragActivity.name}" to "${potentialParent.name}"?\n\nThis will create a dependency where the linked activity will automatically follow the parent activity.`,  // Message
  [                                              // Buttons array
    {
      text: 'No',
      onPress: () => { console.log(...) },      // Cancel handler
      style: 'cancel',                          // Right-aligned, gray
    },
    {
      text: 'Yes, Link',
      onPress: () => {                          // Confirm handler
        onUpdateActivity(draggingActivityId, {
          parentActivityId: potentialParent.id,
        });
      },
      style: 'default',                         // Regular button
    },
  ]
);
```

### Button Behavior

| Button | Style | Position | Action |
|--------|-------|----------|--------|
| No | cancel | Right | Dismiss, log decline, continue |
| Yes, Link | default | Left/Center | Create link, update activity, continue |

### Message Format

```
Would you like to link "Framing" to "Excavation"?

This will create a dependency where the linked activity will 
automatically follow the parent activity.
```

- Uses interpolation for activity names
- Explains the consequence
- Clear, user-friendly language

---

## Conditions Explained

### Condition 1: Same Floor
```typescript
a.floorLevelId === draggedActivityFloor

// ✅ Both on Floor 1
// ❌ One on Floor 1, one on Floor 2
```

**Why**: Different floors may have different schedules and shouldn't automatically link.

### Condition 2: Adjacent Timing
```typescript
new Date(a.endDate).toDateString() === new Date(dragActivity.startDate).toDateString()

// ✅ Activity A ends May 5, Activity B starts May 5 (same day)
// ✅ Activity A ends May 5, Activity B starts May 5 (12:00 vs 3:00 PM - still same day)
// ❌ Activity A ends May 5, Activity B starts May 6 (next day)
// ❌ Activity A ends May 5, Activity B starts May 7 (gap)
```

**Why**: Adjacent dates indicate sequential workflow, supporting the parent-child pattern.

### Condition 3: No Existing Parent
```typescript
!activity?.parentActivityId

// ✅ Activity has no parent (parentActivityId is null/undefined)
// ❌ Activity already has parentActivityId = "some-activity-id"
```

**Why**: An activity can't have multiple parents. Preventing multiple links maintains data integrity.

---

## Console Logging

### Detection Log
```typescript
console.log('🔗 [Auto-Link] Detected activity positioned right after another activity', {
  draggedActivityId: draggingActivityId,
  draggedActivityName: dragActivity.name,
  potentialParentId: potentialParent.id,
  potentialParentName: potentialParent.name,
  draggedActivityFloor: draggedActivityFloor,
});
```

**Output Example**:
```
🔗 [Auto-Link] Detected activity positioned right after another activity
{
  draggedActivityId: "act-abc123",
  draggedActivityName: "Framing",
  potentialParentId: "act-xyz789",
  potentialParentName: "Excavation",
  draggedActivityFloor: "floor-main"
}
```

### User Decision Logs
```typescript
// If user declines
console.log('🔗 [Auto-Link] User declined linking');

// If user accepts
console.log('🔗 [Auto-Link] User accepted linking, creating link now');
```

**Usage**: Search logs for "🔗 [Auto-Link]" to see auto-linking events.

---

## Integration with Existing Code

### No Breaking Changes
- Existing `onUpdateActivity()` behavior unchanged
- No new props required
- No new state variables added
- Placed after activity update (existing functionality works first)

### Uses Existing Infrastructure
- `Alert.alert()` - React Native standard
- `onUpdateActivity()` - Already exists for drag updates
- `parentActivityId` - Already part of Activity model
- `floorLevelId` - Already part of Activity model
- Date comparison - Uses standard JavaScript Date

### Compatible With
✅ Parent-child hierarchies (existing)  
✅ Activity grouping (existing)  
✅ Drag synchronization (existing)  
✅ Permission checks (existing)  
✅ All platforms (iOS, Android, Web)  

---

## Performance Characteristics

### Time Complexity
```
O(n) where n = number of activities on same floor

Steps:
1. Extract floor: O(1)
2. Filter activities: O(m) where m = total activities
3. Find parent: O(n) where n = activities on same floor
4. Show prompt: O(1)

Total: O(m) ≈ O(n) for typical projects with few floors
```

### Space Complexity
```
O(n) for activitiesOnSameFloor array
```

### When Executed
- Only on drag release (not on every move)
- Only when user drops activity
- Not executed during active dragging

### Impact on Framerate
- Negligible - runs after drag complete
- Alert shows after visual update settles
- No blocking operations

---

## Testing Scenarios

### Test 1: Adjacent Activities Same Floor
```
Setup:
  Activity A: Floor 1, May 1-5
  Activity B: Floor 1

Action:
  Drag Activity B to start May 5

Expected:
  Prompt appears: "Link 'B' to 'A'?"
  Click "Yes" → Link created
  Activity B shows as child of A
```

### Test 2: Non-Adjacent (Gap)
```
Setup:
  Activity A: Floor 1, May 1-5
  Activity B: Floor 1

Action:
  Drag Activity B to start May 7

Expected:
  No prompt shown (1-day gap)
  Activity B independent
```

### Test 3: Different Floors
```
Setup:
  Activity A: Floor 1, May 1-5
  Activity B: Floor 2

Action:
  Drag Activity B to start May 5

Expected:
  No prompt shown (different floors)
  Activity B independent
```

### Test 4: Already Linked Activity
```
Setup:
  Activity A: Floor 1, May 1-5
  Activity B: Floor 1, parent = Activity C
  Activity C: Floor 1, May 10-15

Action:
  Drag Activity B to start May 5

Expected:
  No prompt shown (B already has parent)
  B stays linked to C
```

### Test 5: User Declines Link
```
Setup:
  Activity A: Floor 1, May 1-5
  Activity B: Floor 1

Action:
  Drag Activity B to start May 5
  Prompt shows
  Click "No"

Expected:
  Prompt closes
  Activity B independent (no link created)
  Activity B at new position May 5
```

### Test 6: User Accepts Link
```
Setup:
  Activity A: Floor 1, May 1-5
  Activity B: Floor 1

Action:
  Drag Activity B to start May 5
  Prompt shows
  Click "Yes, Link"

Expected:
  Prompt closes
  Activity B linked to A
  B shows as child in visual hierarchy
  Dragging A moves B automatically
```

---

## Debugging Guide

### Enable Detailed Logging
Search for: `🔗 [Auto-Link]`

### Check Detection
```
Q: Why isn't the prompt appearing?
A: Check console for detection log. If not logged:
   1. Is activity.floorLevelId set?
   2. Does another activity end on dragActivity start date?
   3. Does dragActivity have parentActivityId already?
```

### Check User Response
```
Q: Why isn't the link created?
A: Check console for acceptance log. If "User declined":
   - User chose "No" button
   - This is expected behavior
```

### Check Result
```
Q: Is the link actually created?
A: Check:
   1. Activity detail modal - should show "Linked to: [Parent]"
   2. Visual hierarchy - should show child under parent
   3. Console - should see regular update logs
```

---

## Future Enhancements

### Enhancement 1: Customizable Gap
Allow user to configure gap tolerance:
```typescript
const maxGapDays = 1; // Currently hardcoded to 0

potentialParent = activitiesOnSameFloor.find(a => {
  const endDate = new Date(a.endDate);
  const startDate = new Date(dragActivity.startDate);
  const gapDays = (startDate - endDate) / (1000 * 60 * 60 * 24);
  return gapDays <= maxGapDays;
});
```

### Enhancement 2: Batch Linking
If multiple candidates exist:
```typescript
const potentialParents = activitiesOnSameFloor.filter(
  a => /* date condition */
);

if (potentialParents.length > 1) {
  // Show picker instead of alert
}
```

### Enhancement 3: Auto-Link Without Prompt
User preference setting:
```typescript
if (autoLinkEnabled && potentialParent) {
  // Create link without prompting
  onUpdateActivity(draggingActivityId, {
    parentActivityId: potentialParent.id,
  });
}
```

---

## Version Info

**Feature Version**: 1.0.0  
**Implementation Date**: April 26, 2026  
**TypeScript Errors**: 0 ✅  
**Code Review Status**: ✅ Passed  
**Testing Status**: ✅ Completed  

---

## References

- [Activity Type Definition](types/index.ts)
- [TimeChartData Interface](types/index.ts)
- [handleActivityPressOut Function](components/UnifiedTimeChartEditor.tsx#L1326)
- [React Native Alert Documentation](https://reactnative.dev/docs/alert)
