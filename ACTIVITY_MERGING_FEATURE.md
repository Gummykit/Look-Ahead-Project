# Activity Merging by Floor Levels - Feature Implementation

## Overview
When the same activity (same name) is assigned to the same contractor across multiple floor levels, instead of creating separate rows for each floor level, the timechart now consolidates them into a single row with subdivided cells. Each cell is divided into colored squares representing each floor level.

## Implementation Details

### 1. New Utility Function: `groupActivitiesByNameAndContractor()`

**Location**: `components/UnifiedTimeChartEditor.tsx` (lines ~530)

**Purpose**: Groups parent activities by their name and subcontractor ID combination.

**Algorithm**:
1. Filters only parent activities (no parentActivityId)
2. Creates a Map with key: `{activity.name}|{activity.subcontractorId}`
3. Groups all activities with the same name and contractor
4. Sorts each group by floor level ID for consistent ordering
5. Returns array of groups sorted by first activity's start date

**Output**: Array of group objects containing:
- `activities`: Array of Activity objects in the group
- `groupKey`: Unique identifier for the group

### 2. Enhanced `renderDateCells()` Function

**Modified to accept**: Single Activity or Array of Activities

**Key Features**:
- **Backward Compatible**: Still accepts single Activity objects for child activities
- **Grouped Detection**: Automatically detects if input is an array (grouped) or single activity
- **Subdivided Rendering**: When grouped (multiple activities in array):
  - Creates a `subdivisionContainer` (flexDirection: 'column')
  - Each floor level gets a separate colored square
  - Squares are equally sized within the container
  - Borders separate each subdivision

**Cell Rendering Logic**:
```
If single activity:
  → Show one colored indicator

If grouped activities (multiple floors):
  → Show subdivided container
  → Each floor = separate colored square
  → Maintain flex layout for equal sizing
```

### 3. Updated `renderActivityRows()` Function

**Changes**:
- Uses `groupActivitiesByNameAndContractor()` to get grouped activities
- Iterates over groups instead of individual activities
- Treats each group as a single row
- Uses first activity in group as "primary activity"
- Applies actions (complete, started, delete) to all activities in group

**Group Row Display**:
- **Label**: Primary activity name + "(n)" badge showing number of floors
- **Contractor Color Indicator**: Simplified for grouped rows (smaller dot)
- **Cells**: Subdivided if multiple floors, single color if one floor

### 4. New Styles Added

```typescript
// Subdivision container styling
subdivisionContainer: {
  flexDirection: 'column',
  borderRadius: 3,
  borderWidth: 1,
  borderColor: 'rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 1,
  elevation: 1,
}

// Individual subdivision styling
subdividedActivityIndicator: {
  borderRightWidth: 0,
  borderBottomWidth: 0,
}

// Border between subdivisions
subdividedActivityIndicatorBorder: {
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(0, 0, 0, 0.15)',
}
```

## Data Structure Unchanged

No modifications to:
- `Activity` type definition
- `TimeChartData` type definition
- Storage/persistence layer
- API endpoints

All data is stored and retrieved with the same structure. Grouping is purely a presentation layer feature.

## User Experience Changes

### Before (Multiple Rows)
```
Task A | Contractor X | [RED] [RED] [RED]   (Ground Floor)
Task A | Contractor X | [TEAL][TEAL][TEAL] (First Floor)
Task A | Contractor X | [YELLOW]...          (Second Floor)
```

### After (Single Row with Subdivisions)
```
Task A (3) | Contractor X | [RED/TEAL/YELLOW stacked] [RED/TEAL/YELLOW stacked] ...
```

## Interaction Behavior

### Status Buttons (Mark as Started, Complete)
- Clicking toggles status for **ALL** activities in the group simultaneously
- Visual indicator shows status of primary activity

### Delete Button
- Clicking removes **ALL** activities in the group (all floor levels)
- Single confirmation prompt

### Drag & Drop
- Dragging moves the primary activity
- All grouped activities move together (existing child activity coordination logic)
- Offset calculation uses primary activity's movement

### Daily Activity Logs
- Logging on any activity in the group affects that specific activity
- Daily log indicator shows if ANY activity in group has logs for that day

## Backward Compatibility

✅ **Fully Backward Compatible**:
- Single activities on one floor render as normal (1 color square)
- Child activities continue to work as before
- No data structure changes
- Existing projects unaffected
- Can add new activities to existing groups dynamically

## Potential Future Enhancements

1. **Subdivision Colors**: Could allow color customization or patterns for visual distinction
2. **Drag Individual Floors**: Could enable dragging specific floor levels independently
3. **Floor Legend in Row**: Could show floor names/numbers in the group row
4. **Grouping Options**: Could add UI toggle to merge/unmerge groups
5. **Bulk Operations**: Could add group-level operations (e.g., mark entire group complete)

## Testing Checklist

- [x] Multiple activities with same name/contractor create single row
- [x] Cell subdivisions display correctly with floor colors
- [x] Status buttons toggle all activities in group
- [x] Delete removes all activities in group
- [x] Drag movement works for grouped activities
- [x] Child activities continue to work
- [x] Single-floor activities render normally
- [x] Daily activity logs work per activity
- [x] No TypeScript compilation errors
- [x] Metro bundler starts without errors

## Files Modified

1. **`components/UnifiedTimeChartEditor.tsx`**
   - Added `groupActivitiesByNameAndContractor()` function
   - Modified `renderDateCells()` to support arrays
   - Modified `renderActivityRows()` to use grouping
   - Added new styles for subdivisions

## Summary

This feature significantly improves the timechart's usability when multiple floor levels are assigned to the same activity and contractor. Instead of cluttering the view with duplicate rows, a single consolidated row displays all floor levels with visually distinct colored subdivisions within each date cell. All interactions (status tracking, deletion, dragging) work seamlessly on grouped activities, treating them as a cohesive unit while preserving individual data integrity.
