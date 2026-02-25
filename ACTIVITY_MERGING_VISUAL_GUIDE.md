# Activity Merging Feature - Visual Guide

## Overview Diagram

### Before Implementation
```
Timechart View (Multiple Rows for Same Activity)
═══════════════════════════════════════════════════════

Activity Name    │Contractor    │ Mon    │ Tue    │ Wed
─────────────────┼──────────────┼────────┼────────┼─────
Flooring         │ ABC Floors   │ [RED]  │ [RED]  │ [RED]     ← Ground Floor
Flooring         │ ABC Floors   │[TEAL]  │[TEAL]  │[TEAL]     ← First Floor
Flooring         │ ABC Floors   │[YELLOW]│[YELLOW]│[YELLOW]   ← Second Floor

Problem: 3 rows for the same task! Cluttered view.
```

### After Implementation
```
Timechart View (Single Row with Subdivisions)
═══════════════════════════════════════════════════════

Activity Name    │Contractor    │ Mon         │ Tue         │ Wed
─────────────────┼──────────────┼─────────────┼─────────────┼─────
Flooring (3)     │ ABC Floors   │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐
                 │              │ │[RED]    │ │ │[RED]    │ │ │[RED]    │
                 │              │ ├─────────┤ │ ├─────────┤ │ ├─────────┤
                 │              │ │[TEAL]   │ │ │[TEAL]   │ │ │[TEAL]   │
                 │              │ ├─────────┤ │ ├─────────┤ │ ├─────────┤
                 │              │ │[YELLOW] │ │ │[YELLOW] │ │ │[YELLOW] │
                 │              │ └─────────┘ │ └─────────┘ │ └─────────┘

Benefit: Single consolidated row, all 3 floors visible with color distinction!
```

## Technical Flow

### 1. Activity Grouping

```javascript
// Input: Raw Activities
activities = [
  { id: 'a1', name: 'Flooring', subcontractorId: 'c1', floorLevelId: 'f1', color: 'RED' },
  { id: 'a2', name: 'Flooring', subcontractorId: 'c1', floorLevelId: 'f2', color: 'TEAL' },
  { id: 'a3', name: 'Flooring', subcontractorId: 'c1', floorLevelId: 'f3', color: 'YELLOW' },
  { id: 'a4', name: 'Painting', subcontractorId: 'c2', floorLevelId: 'f1', color: 'RED' },
]

↓ groupActivitiesByNameAndContractor()

// Output: Grouped Activities
groups = [
  {
    groupKey: 'c1Flooring',
    activities: [
      { id: 'a1', ... color: 'RED' },
      { id: 'a2', ... color: 'TEAL' },
      { id: 'a3', ... color: 'YELLOW' },
    ]
  },
  {
    groupKey: 'c2Painting',
    activities: [
      { id: 'a4', ... color: 'RED' },
    ]
  },
]
```

### 2. Row Rendering

```
renderActivityRows()
  │
  ├─→ groupActivitiesByNameAndContractor()
  │   └─→ Returns groups sorted by start date
  │
  ├─→ For each group:
  │   ├─→ Extract primaryActivity (first in group)
  │   ├─→ Check if isGrouped (length > 1)
  │   ├─→ Render single row with:
  │   │   ├─→ Activity name + "(n)" badge
  │   │   ├─→ Contractor name
  │   │   ├─→ Action buttons (complete, start, delete)
  │   │   └─→ Chart area with date cells
  │   │
  │   └─→ renderDateCells(activities, startDay)
  │       └─→ Each cell shows subdivisions
  │
  └─→ Render child activities below each group
```

### 3. Cell Rendering Logic

```
renderDateCells(activities, startDay)
  │
  ├─→ Determine if single or grouped
  │   └─→ isGrouped = activities.length > 1
  │
  ├─→ For each day in timeline:
  │   │
  │   └─→ Create date cell:
  │       ├─→ If single activity:
  │       │   └─→ Show one colored square
  │       │       ┌────────────┐
  │       │       │            │
  │       │       │   [COLOR]  │
  │       │       │            │
  │       │       └────────────┘
  │       │
  │       └─→ If grouped activities:
  │           └─→ Show subdivided squares
  │               ┌────────────┐
  │               │ [COLOR 1]  │
  │               ├────────────┤
  │               │ [COLOR 2]  │
  │               ├────────────┤
  │               │ [COLOR 3]  │
  │               └────────────┘
  │               (Equal height, flex layout)
  │
  └─→ Return array of cells
```

## Component Structure

```
UnifiedTimeChartEditor
  ├─ State Management
  │  └─ Existing: activities, draggingActivityId, etc.
  │
  ├─ Utility Functions (NEW)
  │  └─ groupActivitiesByNameAndContractor()
  │     └─ Groups by: `${name}|${subcontractorId}`
  │
  ├─ Render Functions
  │  ├─ renderDayHeaders()
  │  ├─ renderMonthHeaders()
  │  ├─ renderDateCells() (ENHANCED)
  │  │  └─ Now accepts: Activity | Activity[]
  │  │  └─ Renders subdivisions if array
  │  │
  │  ├─ renderActivityRows() (ENHANCED)
  │  │  └─ Uses grouping logic
  │  │  └─ Renders groups instead of individual activities
  │  │
  │  ├─ ... other render functions ...
  │
  └─ Return JSX
     └─ Displays grouped activities with subdivisions
```

## Interaction Examples

### Example 1: Marking Activity as Complete

```
User clicks "✓" button on "Flooring (3)" row
  │
  ├─ Check: Can user mark activities complete? ✓
  │
  ├─ Action: For each activity in group:
  │  ├─ Activity 1 (Ground): isCompleted = !false = true
  │  ├─ Activity 2 (First):  isCompleted = !false = true
  │  └─ Activity 3 (Second): isCompleted = !false = true
  │
  ├─ UI Update:
  │  └─ All 3 subdivisions in each cell fade to gray
  │
  └─ Storage: All 3 activities saved with isCompleted: true
```

### Example 2: Dragging a Grouped Activity

```
User drags "Flooring (3)" row from Monday to Wednesday (2 days forward)
  │
  ├─ Identify: draggingActivityId = 'a1' (primary activity)
  │
  ├─ Calculate: offset = 2 days forward
  │
  ├─ Update: For each activity in group:
  │  ├─ Activity 1 (Ground):   startDate += 2 days, endDate += 2 days
  │  ├─ Activity 2 (First):    startDate += 2 days, endDate += 2 days
  │  └─ Activity 3 (Second):   startDate += 2 days, endDate += 2 days
  │
  ├─ Update: Child activities (if any):
  │  └─ Same offset applied (existing logic)
  │
  ├─ UI Update:
  │  └─ All cells shift right to show new position
  │
  └─ Storage: All 3 activities saved with new dates
```

### Example 3: Deleting a Grouped Activity

```
User clicks "✕" button on "Flooring (3)" row
  │
  ├─ Check: Can user delete activities? ✓
  │
  ├─ Action: Delete each activity in group:
  │  ├─ Delete Activity 1 (Ground)
  │  ├─ Delete Activity 2 (First)
  │  └─ Delete Activity 3 (Second)
  │
  ├─ Cascade: If any has child activities:
  │  └─ Delete all child activities too (existing logic)
  │
  ├─ UI Update:
  │  └─ Entire row disappears
  │
  └─ Storage: All 3 activities removed from timechart
```

## State Management

### No Changes to Core State
```
timechart.activities = [
  { id: 'a1', name: 'Flooring', subcontractorId: 'c1', floorLevelId: 'f1', ... },
  { id: 'a2', name: 'Flooring', subcontractorId: 'c1', floorLevelId: 'f2', ... },
  { id: 'a3', name: 'Flooring', subcontractorId: 'c1', floorLevelId: 'f3', ... },
  // Each activity remains individual in storage
]
```

### Grouping is Computed at Render Time
```
render() {
  groupedActivities = groupActivitiesByNameAndContractor()
  return <View>{render groups}</View>
}
// Grouping recalculates whenever timechart.activities changes
// via useMemo() dependency on timechart.activities
```

## Key Design Decisions

### 1. Why Group at Render Time?
- ✓ No data structure changes needed
- ✓ Backward compatible with existing data
- ✓ Easy to toggle on/off if needed
- ✓ Cleaner code separation (presentation vs data)

### 2. Why Subdivide Cells Vertically?
- ✓ All floors visible in single cell
- ✓ Color distinction preserved
- ✓ Easy to see distribution across floors
- ✓ Fits within existing cell size

### 3. Why Apply Actions to Entire Group?
- ✓ Logical: Same task on same contractor
- ✓ Convenient: One button for all floors
- ✓ Consistent: Status synchronized across floors
- ✓ User expectation: "Mark Flooring as complete"

### 4. Why Keep Individual Activity Storage?
- ✓ Preserves data integrity
- ✓ Enables per-floor daily logs
- ✓ Simplifies child activity logic
- ✓ Future flexibility for independent operations

## Edge Cases Handled

### Single Activity in Group
```
Activity: Flooring (1) - Only Ground Floor
Render: Single color square (not subdivided)
Behavior: Works like non-grouped activity
```

### Activities with Different Start/End Dates
```
Activity 1 (Ground):  Jan 1-10
Activity 2 (First):   Jan 5-15  ← Different dates!

Result: Both shown in same row
Cells:  Show/hide based on respective date ranges
Note:   This shouldn't normally happen, but handled safely
```

### Child Activities Under Grouped Parent
```
Flooring (3) - Parent Group
  ├─ Tile Floor - Child 1 (follows Ground floor timeline)
  ├─ Paint Walls - Child 2 (follows First floor timeline)
  └─ Trim Work - Child 3 (follows Second floor timeline)

Result: Each group renders its own child rows
```

## Performance Considerations

### Optimization: useMemo
```javascript
const memoizedActivityRows = useMemo(
  () => renderActivityRows(),
  [timechart.activities, timechart.subcontractors, ...]
)

// Recomputes only when dependencies change
// Prevents re-render on unrelated state changes
```

### Complexity Analysis
```
Time: O(n log n) where n = number of activities
  - Grouping: O(n)
  - Sorting: O(n log n)
  - Rendering: O(n)

Space: O(n) for grouped structure
  - Temporary map during grouping
  - Discarded after render
```

## Future Enhancements Roadmap

1. **Visual Indicators in Label**
   ```
   Flooring [🟥 🔲 ⬛] ← Color boxes showing floor levels
   ```

2. **Floor-Level Specific Operations**
   ```
   Right-click on subdivision → Mark this floor complete
   ```

3. **Grouping Toggle UI**
   ```
   Settings → [ ] Merge same activities by contractor
   ```

4. **Advanced Cell Subdivision**
   ```
   Horizontal split if same floor levels
   Vertical split if different floor levels
   ```

5. **Bulk Timeline Editing**
   ```
   Right-click group → "Reschedule all"
   ```
