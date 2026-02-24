# Parent-Child Activity Feature Documentation

## Overview
The parent-child activity feature allows users to create sequential activities where a child activity automatically starts immediately after its parent activity completes. This is useful for modeling dependent tasks in construction projects (e.g., Excavation → Inspection, Foundation → Framing, etc.).

## Key Features

### 1. Creating Parent-Child Activities
When adding a new activity, users can now:
- Enter the parent activity details (name, dates, contractor, floor level)
- Enable "Add Child Activity" checkbox (optional)
- Enter child activity name
- Specify child activity duration in days
- Both activities are created in a single operation

### 2. Sequential Scheduling
- **Parent Activity**: Runs from specified start date to end date
- **Child Activity**: Automatically starts the day after parent activity ends
  - Example: If parent ends on Jan 10, child starts on Jan 11
  - Child duration is specified in days (e.g., 3 days)
  - Child end date is calculated automatically

### 3. Visual Representation
- **Parent Activity**: Displayed normally with full styling
- **Child Activity**: 
  - Indented with an arrow symbol (↳) to show relationship
  - Slightly faded background color (#FAFAFA)
  - Blue left border to indicate child status
  - Italic font style for distinction
  - Same contractor/floor level as parent (inherited)

### 4. Coordinated Movement
When dragging a parent activity on the timeline:
- Parent activity moves to new dates
- All child activities move by the same number of days automatically
- Timeline continuity is maintained
- No manual adjustment needed

### 5. Cascading Deletion
When deleting a parent activity:
- All child activities are automatically deleted
- No orphaned activities left behind
- Single action removes entire activity chain

## Technical Implementation

### Type Updates (`types/index.ts`)
```typescript
export interface Activity {
  // ... existing fields ...
  parentActivityId?: string;      // ID of parent activity (if this is a child)
  childActivityIds?: string[];    // Array of child activity IDs
  childDuration?: number;         // Duration of child activity (temporary, used during creation)
  childActivityName?: string;     // Name of child activity (temporary, used during creation)
}
```

### Component Updates

#### UnifiedTimeChartEditor.tsx
**New State Variables:**
- `hasChildActivity`: Boolean to toggle child activity form
- `childActivityName`: Name input for child activity
- `childActivityDuration`: Duration input (in days)

**New Form Section:**
- Checkbox to enable child activity creation
- Conditional input fields for child activity details
- Helper text explaining automatic scheduling

**Updated Rendering:**
- `renderActivityRows()`: Now filters to show only parent activities
- Renders child activities directly below their parent
- Child rows have distinct styling (arrow prefix, faded background)

**Updated Drag Logic:**
- `handleActivityPressOut()`: Detects parent activities with children
- Calculates offset (days moved)
- Updates all child activities by same offset
- Maintains sequential relationship

#### App Handler (app/editor.tsx)
**Updated handleAddActivity:**
- Generates unique ID for parent activity
- Calculates child activity start/end dates based on parent
- Creates child activity starting day after parent ends
- Sets `parentActivityId` and `childActivityIds` relationships

**Updated handleRemoveActivity:**
- Finds activity and its children
- Removes parent and all child activities together
- Prevents orphaned activities

### Styling Additions
```typescript
// Child Activity Form
childActivityToggleContainer: { flexDirection: 'row', alignItems: 'center' }
checkboxSquare: { width: 20, height: 20, borderWidth: 2, borderColor: '#0066CC' }
checkboxSquareChecked: { backgroundColor: '#0066CC' }
checkboxCheckmark: { color: '#FFF', fontSize: 14, fontWeight: 'bold' }

// Child Activity Rendering
childActivityRow: { 
  backgroundColor: '#FAFAFA', 
  borderLeftWidth: 3, 
  borderLeftColor: '#0066CC',
  marginLeft: 8 
}
childActivityCellText: { fontSize: 13, fontStyle: 'italic', color: '#555' }
```

## Usage Examples

### Example 1: Excavation → Inspection
1. **Add Parent Activity**: 
   - Name: "Excavation"
   - Start: Jan 1, End: Jan 10
   - Contractor: ABC Corp
   - Floor Level: Ground

2. **Add Child Activity** (enable checkbox):
   - Name: "Inspection"
   - Duration: 2 days

3. **Result**:
   - Excavation: Jan 1-10 (10 days)
   - Inspection: Jan 11-12 (2 days)
   - Automatically sequential

### Example 2: Foundation → Framing
1. **Parent Activity**: Foundation (Jan 1-15)
2. **Child Activity**: Framing (5 days)
3. **Timeline**:
   - Foundation: Jan 1-15
   - Framing: Jan 16-20
   - Inspection moves Foundation → both move together

## Behavior Details

### Activity Creation
- Parent and child activities created atomically
- If child activity info is missing but checkbox is enabled, creation fails
- Both share same contractor and floor level
- Each has unique ID for tracking

### Timeline Management
- Child activities always start immediately after parent
- Moving parent maintains temporal relationship
- Cannot manually adjust relationship once created
- To change relationship, delete and recreate

### Data Persistence
- Parent-child relationships stored in Activity objects
- `parentActivityId` for child activities
- `childActivityIds` array on parent activities
- Backward compatible: activities without these fields work as standalone

### Permission Handling
- Child activity inherits parent's permissions
- Both marked as started/completed together
- Deletion checks apply to both
- Editing permissions apply to parent only

## UI Components

### Add Activity Modal Enhancement
**New Section**: "Add Child Activity (Optional)"
- Checkbox with label
- Conditional rendering of child fields
- Helper text: "Child activity will start immediately after parent activity ends"
- Duration input with numeric keyboard

### Timeline Display
**Parent Activity Row**:
- Normal appearance
- All control buttons (delete, mark complete, mark started)

**Child Activity Row**:
- Indented with left border
- Arrow prefix (↳) on name
- Faded styling to show dependency
- Same control buttons as parent

### Management Panel
- Lists only parent activities
- Children displayed as sub-rows
- Delete button on parent removes all

## Limitations & Considerations

1. **Single-Level Only**: Currently supports only one level of nesting (parent → child)
   - Not: Parent → Child → Grandchild

2. **Sequential Only**: Child must start day after parent ends
   - No overlaps or gaps allowed
   - No customizable relationships

3. **Single Child**: Each parent can have only one child activity chain
   - Not multiple children per parent

4. **Shared Properties**: Child inherits contractor and floor level
   - Cannot assign different contractor to child

5. **No Manual Override**: Cannot drag/reposition child independently
   - Child movement is automated with parent

## Future Enhancements

Potential improvements:
- [ ] Support multiple children per parent
- [ ] Configurable gap between parent and child (e.g., 1-day gap)
- [ ] Multi-level nesting (parent → child → grandchild)
- [ ] Allow different contractors for child activities
- [ ] Conditional child creation based on parent completion
- [ ] Child activity templates

## Testing Recommendations

1. **Creation Tests**:
   - Create activity with child activity
   - Verify child starts day after parent
   - Check dates are correct
   - Verify contractor/floor level inheritance

2. **Movement Tests**:
   - Drag parent activity
   - Verify child moves by same offset
   - Check dates remain sequential
   - Test moving to different months

3. **Deletion Tests**:
   - Delete parent activity
   - Verify child is also deleted
   - Check no orphaned activities

4. **Completion Tests**:
   - Mark parent as complete
   - Mark parent as started
   - Verify child can be marked independently

5. **Edge Cases**:
   - Create child with 1-day duration
   - Create child with many days duration
   - Move to project boundaries
   - Test with multiple parent-child pairs

## Summary

The parent-child activity feature provides an elegant way to model dependent construction activities. The automatic scheduling, synchronized movement, and cascading deletion make it easy to manage activity chains without manual coordination.
