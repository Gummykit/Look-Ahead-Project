# Activity Status Flags Feature

## Overview
Added two status flags to activities allowing contractors and sub-contractors to track task progress:
1. **Mark as Started** - Button that turns green when clicked, indicating activity has begun
2. **Mark as Complete** (✓) - Checkmark with strikethrough on activity name

## Changes Made

### 1. Type Definition Update
**File**: `types/index.ts`

Added two optional status fields to the `Activity` interface:
```typescript
export interface Activity {
  // ... existing fields ...
  isStarted?: boolean;     // Marks activity as started with a small green tick
  isCompleted?: boolean;   // Marks activity as complete with strikethrough
}
```

### 2. Handler Functions
**File**: `components/UnifiedTimeChartEditor.tsx`

#### handleToggleActivityStarted()
- Checks user permission (`canEdit`) before allowing started toggle
- Only contractors and sub-contractors can mark activities as started
- Updates activity state by toggling `isStarted` boolean
- Shows permission denied alert for unauthorized users

#### handleToggleActivityCompletion()
- Checks user permission (`canEdit`) before allowing completion toggle
- Only contractors and sub-contractors can mark activities as complete
- Updates activity state by toggling `isCompleted` boolean
- Shows permission denied alert for unauthorized users

### 3. UI Toggle Buttons
**File**: `components/UnifiedTimeChartEditor.tsx` (renderActivityRows)

Two action buttons now appear in the activity row:

1. **Mark as Started Button** - Styled button with rounded corners
   - Light gray background (#F0F0F0) with gray border (#DDD) by default
   - White text "Mark as started" (11px font)
   - Turns green (#4CAF50) with white text when started
   - Positioned before complete button
   - Clear, readable label

2. **Complete Button** (✓) - Checkmark icon
   - Gray (#999) when not completed
   - Green (#4CAF50) when completed
   - Positioned before delete button

3. **Delete Button** (✕) - Remains unchanged
   - Red (#FF4444)
   - Positioned at the end

### 4. Visual Styling

#### Started Status Indicators
Added styles for started activity button:
- `startedButton`: Gray background (#F0F0F0), rounded corners, bordered style
- `startedButtonActive`: Green background (#4CAF50) when started
- `startedButtonText`: Dark gray text (11px), bold font
- `startedButtonTextActive`: White text when button is active

#### Completion Status Indicators (Updated)
- `completeActivityText`: Gray color (#999), 16px font
- `completeActivityTextActive`: Green color (#4CAF50), 16px font
- `completedActivityCellText`: Strikethrough text with opacity 0.6
- `completedActivityIndicator`: Faded bar (50% opacity, gray #CCCCCC)

### 5. Interactive Behaviors

#### Activity Name Display
- Shows strikethrough when `isCompleted` is true
- Displays normal when only `isStarted` is true
- No visual change to name when `isStarted` only

#### Timeline Bar Appearance
- Fades and turns gray when `isCompleted` is true
- Normal appearance when only `isStarted` is true
- Each status can be toggled independently

#### Button States
- Started button turns green when activity is started
- Complete button turns green when activity is completed
- Both buttons can be pressed individually
- Can mark as started without completing
- Can mark as completed without marking started
- Can toggle either status on/off

## User Workflow

### Step 1: Add Activity
User creates a new activity (defaults to isStarted: false, isCompleted: false)

### Step 2: Mark as Started
User clicks the small green tick (✓) button to indicate work has begun
- Button turns green
- Activity name remains normal
- Timeline bar appears normal

### Step 3: Mark as Complete
User clicks the larger checkmark (✓) button to mark activity finished
- Button turns green
- Activity name shows strikethrough
- Timeline bar fades to gray (50% opacity)
- Activity can be completed without being marked started first

### Step 4: Toggle Status
User can click either button again to undo the status
- Removes strikethrough from name
- Restores timeline bar to full opacity

## Permission Model
- **Contractors**: Can toggle both started and complete status ✓
- **Sub-contractors**: Can toggle both started and complete status ✓
- **Observers**: Cannot toggle any status (view-only)

Permission checks use the existing `canPerformAction(user.role, 'canEdit')` utility function.

## Visual Summary

| State | Started Button | Complete Button | Activity Name | Timeline Bar |
|-------|---|---|---|---|
| Fresh | Gray button | Gray ✓ | Normal | Normal |
| Started | Green button | Gray ✓ | Normal | Normal |
| Completed | Gray button | Green ✓ | Strikethrough | Faded Gray |
| Both | Green button | Green ✓ | Strikethrough | Faded Gray |

## Data Persistence
Both status flags are saved via `onUpdateActivity()` callback, which persists to:
- AsyncStorage (mobile)
- Backend API (if configured)

## Testing Checklist
- [ ] Login as contractor1
- [ ] Add an activity
- [ ] Click started button (✓) - should turn green
- [ ] Click complete button (✓) - should turn green, name strikethrough
- [ ] Click started button again - should toggle off
- [ ] Click complete button again - should remove strikethrough
- [ ] Login as observer1
- [ ] Verify cannot click either button
- [ ] Logout and verify data persisted

## Compilation Status
✅ All TypeScript compiles without errors
✅ No breaking changes to existing functionality
✅ Backwards compatible with existing activities (both flags default to undefined/false)

## Files Modified
- `types/index.ts` - Added isStarted and isCompleted fields
- `components/UnifiedTimeChartEditor.tsx` - Handler functions, UI buttons, styling

## Future Enhancements
- Progress percentage based on started/completed activities
- Timeline highlighting for started activities
- Status change history/audit trail
- Notification when all activities are completed
- Bulk status operations
- Activity status filtering/sorting

