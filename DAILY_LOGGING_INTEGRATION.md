# Daily Activity Logging Integration Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   app/editor.tsx                             │
│    (Project Load & State Management)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  • Loads project from AsyncStorage                          │
│  • Maintains timechart state                                │
│  • Handlers:                                                │
│    - handleAddOrUpdateDailyLog()  ◄──────────────┐         │
│    - handleRemoveDailyLog()                       │         │
│    - Calls onAddOrUpdateDailyLog callback        │         │
│                                                   │         │
└────────────────┬─────────────────────────────────┘         │
                 │                                             │
    Passes handlers to component                              │
                 │                                             │
                 ▼                                             │
┌─────────────────────────────────────────────────────────────┐│
│         components/UnifiedTimeChartEditor.tsx                ││
│    (Main Timechart UI & Modal Management)                  ││
├─────────────────────────────────────────────────────────────┤│
│                                                              ││
│  State:                                                      ││
│  • showDailyLogModal: boolean                              ││
│  • selectedActivityForLog: Activity | null                 ││
│  • selectedLogDate: Date | null                            ││
│                                                              ││
│  Handlers:                                                   ││
│  • handleCellPress(activity, dayIndex)                     ││
│    - Validates date is working day                         ││
│    - Checks activity spans date                            ││
│    - Opens modal with activity & date info                 ││
│                                                              ││
│  • handleDailyLogSave(notes, imageUris)                    ││
│    - Calls onAddOrUpdateDailyLog (from parent)             ││
│    - Closes modal                                          ││
│    - Shows success confirmation                           ││
│                                                              ││
│  • getExistingLogForCell(activity, dayIndex)               ││
│    - Finds existing log in dailyActivityLogs array         ││
│    - Returns log or null                                   ││
│                                                              ││
│  Rendering:                                                  ││
│  • Cells wrapped in TouchableOpacity                        ││
│  • Log indicator dots on logged cells                       ││
│  • renderDateCells() creates activity bars                 ││
│                                                              ││
└─────────────┬──────────────────────────────────────────────┘│
              │                                                 │
              │  showDailyLogModal = true                      │
              │  + selectedActivityForLog                      │
              │  + selectedLogDate                             │
              │                                                 │
              ▼                                                 │
┌──────────────────────────────────────────────────────────────┤
│      components/DailyActivityLogModal.tsx                    ││
│       (Daily Log Data Entry Interface)                       ││
├──────────────────────────────────────────────────────────────┤
│                                                               ││
│  Props:                                                       ││
│  • isVisible: boolean                                        ││
│  • activity: Activity | null                                ││
│  • logDate: Date | null                                     ││
│  • existingLog: DailyActivityLog | null                     ││
│  • onClose: () => void                                      ││
│  • onSave: (notes, imageUris) => void                       ││
│                                                               ││
│  State:                                                       ││
│  • notes: string                                            ││
│  • imageUris: string[]                                      ││
│  • loading: boolean                                         ││
│                                                               ││
│  Features:                                                    ││
│  • Display activity info & date                            ││
│  • Notes textarea with char counter                        ││
│  • Photo buttons (Take/Gallery)                           ││
│  • Image grid with remove option                          ││
│  • Save button (disabled if no data)                       ││
│  • Loading spinner during save                            ││
│                                                               ││
│  On Save Click:                                              ││
│  • Validate: notes.trim() OR imageUris.length > 0         ││
│  • Call onSave(notes, imageUris)                          ││
│  • Close modal on success                                 ││
│                                                               ││
└────────────────┬─────────────────────────────────────────────┤
                 │  onSave callback                             │
                 │  (notes, imageUris)                          │
                 │                                              │
                 └──────────────────────────────────────────┐   │
                                                             │   │
                                                             ▼   │
                              Returns to handleDailyLogSave()   │
                              in UnifiedTimeChartEditor.tsx     │
                                                                │
                                                                │
┌─────────────────────────────────────────────────────────────┘
│
├─ Calls parent handler: onAddOrUpdateDailyLog(
│   selectedActivityForLog.id,
│   selectedLogDate,
│   notes,
│   imageUris
│ )
│
└─────────────────────────────────────────────────────────────┐
                                                              │
                    ▼                                         │
┌───────────────────────────────────────────────────────────┐ │
│           utils/storage.ts                               │ │
│   (Data Persistence)                                     │ │
├───────────────────────────────────────────────────────────┤ │
│                                                           │ │
│  • saveTimechart()                                      │ │
│    - Serializes all dates to ISO strings               │ │
│    - Handles dailyActivityLogs[] serialization          │ │
│    - Saves to AsyncStorage                             │ │
│                                                           │ │
│  • getTimechart()                                       │ │
│    - Deserializes dailyActivityLogs                     │ │
│    - Converts date strings back to Date objects         │ │
│    - Migration support for backward compatibility       │ │
│                                                           │ │
│  • getAllTimecharts()                                   │ │
│    - Batch retrieval of all projects                    │ │
│    - Maps dailyActivityLogs for each project            │ │
│                                                           │ │
└───────────────────────────────────────────────────────────┘ │
                                                                │
└────────────────────────────────────────────────────────────────
```

## Data Flow: Logging a Daily Activity

```
USER CLICKS ACTIVITY CELL
         │
         ▼
handleCellPress(activity, dayIndex)
         │
         ├─ Calculate cellDate
         ├─ Check: NOT holiday AND NOT weekend
         ├─ Check: Activity spans this date
         ├─ setSelectedActivityForLog(activity)
         ├─ setSelectedLogDate(cellDate)
         └─ setShowDailyLogModal(true)
         │
         ▼
DailyActivityLogModal Opens
         │
         ├─ useEffect loads existingLog if available
         ├─ Display activity info & date
         └─ Focus on notes input
         │
         ▼
USER ENTERS DATA
         │
         ├─ Type notes (state: notes)
         ├─ Add photos (state: imageUris)
         │
         ▼
USER TAPS SAVE
         │
         ├─ Validate: notes OR images required
         ├─ Show loading spinner
         └─ Call onSave(notes, imageUris)
         │
         ▼
handleDailyLogSave() in UnifiedTimeChartEditor
         │
         ├─ Call onAddOrUpdateDailyLog(
         │   activityId,
         │   date,
         │   notes,
         │   imageUris
         │ )
         ├─ Close modal
         ├─ Reset states
         └─ Show success alert
         │
         ▼
handleAddOrUpdateDailyLog() in editor.tsx
         │
         ├─ Find/create DailyActivityLog
         ├─ Update timechart state
         ├─ Call saveTimechart()
         │
         ▼
saveTimechart() in storage.ts
         │
         ├─ Serialize dailyActivityLogs
         ├─ Save to AsyncStorage
         │
         ▼
DATA PERSISTED
         │
         └─ Log indicator dot appears on cell
```

## Event Flow: Click Cell → Log Saved → Indicator Shows

```
TIME    EVENT                           STATE CHANGE
────────────────────────────────────────────────────────
t0      User clicks activity bar        No change yet

t1      Cell press detected by          onResponderGrant
        TouchableOpacity within         prevents drag

t2      handleCellPress executed        • showDailyLogModal: false → true
                                        • selectedActivityForLog: null → Activity
                                        • selectedLogDate: null → Date

t3      Modal animates into view        Component tree:
                                        UnifiedTimeChartEditor
                                          └─ DailyActivityLogModal
                                             └─ Modal (visible=true)

t4      Modal useEffect runs            notes, imageUris load from
        (load existing log)             existingLog or empty

t5      User adds notes & photos        Component state updates:
                                        • notes: "..." (text input)
                                        • imageUris: [...] (gallery)

t6      User taps Save button           handleDailyLogSave() executes

t7      Parent handler called           onAddOrUpdateDailyLog(
        in editor.tsx                   activityId, date, notes, uris
                                        )

t8      Timechart state updated         timechart.dailyActivityLogs
                                        includes new log

t9      saveTimechart() async           AsyncStorage persists data

t10     Modal closes, reset states      • showDailyLogModal: true → false
                                        • selectedActivityForLog: null
                                        • selectedLogDate: null

t11     Re-render occurs                renderDateCells() runs again
                                        getExistingLogForCell() now
                                        returns the saved log

t12     Log indicator dot visible       Dot rendered via:
                                        styles.logIndicatorDot
                                        styles.logIndicatorDotActive
```

## Callbacks & Handlers

### From editor.tsx → UnifiedTimeChartEditor
```typescript
onAddOrUpdateDailyLog: (
  activityId: string,
  date: Date,
  notes: string,
  imageUris: string[]
) => void
```

### From UnifiedTimeChartEditor → DailyActivityLogModal
```typescript
// Opening
• showDailyLogModal: boolean
• selectedActivityForLog: Activity | null
• selectedLogDate: Date | null
• existingLog: DailyActivityLog | null

// Closing
onClose: () => void

// Saving
onSave: (notes: string, imageUris: string[]) => void
```

## Type Definitions (types/index.ts)

```typescript
interface DailyActivityLog {
  id: string;
  activityId: string;
  date: Date;
  notes: string;
  imageUris: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface TimeChartData {
  // ... other properties
  dailyActivityLogs: DailyActivityLog[];
}
```

## Storage Layer Integration

### Serialization (saveTimechart)
```typescript
// Images stored as URIs
// Dates converted to ISO strings
dailyActivityLogs.map(log => ({
  ...log,
  date: log.date.toISOString(),
  createdAt: log.createdAt.toISOString(),
  updatedAt: log.updatedAt.toISOString(),
}))
```

### Deserialization (getTimechart)
```typescript
// Dates converted back to Date objects
dailyActivityLogs.map(log => ({
  ...log,
  date: new Date(log.date),
  createdAt: new Date(log.createdAt),
  updatedAt: new Date(log.updatedAt),
}))
```

## Component Composition

```
App/Project
    ↓
editor.tsx (State management)
    ↓
UnifiedTimeChartEditor.tsx (Main UI)
    ├─ Header (5 control buttons)
    ├─ Month/Day Headers
    ├─ Activity Rows (mapping function)
    │   ├─ Activity Cell (name, contractor)
    │   ├─ Contractor Cell (name, color)
    │   └─ Date Cells (clickable bars)
    │       └─ TouchableOpacity (activity indicator)
    │           └─ Log indicator dot (if logged)
    │
    ├─ Manage Modal
    ├─ Add Holiday Modal
    ├─ Add Activity Modal
    ├─ Add Contractor Modal
    ├─ Floor Level Modal
    │
    └─ DailyActivityLogModal.tsx (NEW!)
        ├─ Header (title, back, save)
        ├─ Date display
        ├─ Notes section
        ├─ Photo buttons
        ├─ Image gallery
        └─ Info section
```

## Error Handling & Validation

### In handleCellPress()
```
if (isHoliday || isWeekend)
  → Alert: "Cannot Log" on non-working days
  
if (dayIndex outside activity range)
  → Alert: "Cannot Log" activity doesn't span date
```

### In DailyActivityLogModal.handleSave()
```
if (!notes.trim() && imageUris.length === 0)
  → Alert: "Please add notes or at least one image"
  
if (imageUris permission denied)
  → Alert: "Permission needed" + "Camera/Gallery permission"
```

### In storage.ts
```
Handles date serialization/deserialization
Provides migration for backward compatibility
```

## Testing the Feature

### Manual Testing Steps
1. Create a new project with 2+ week duration
2. Add an activity spanning multiple days
3. Navigate to a working day within the activity
4. Click the colored activity indicator
5. Modal should open with activity & date info
6. Add notes (text entry)
7. Add photos (take or from gallery)
8. Tap Save
9. Confirm success alert
10. Return to timechart view
11. Verify log indicator dot on clicked cell
12. Click same cell again
13. Confirm notes/images load in modal
14. Edit content and save again
15. Try logging on holiday/weekend (should be blocked)
16. Restart app and verify logs persist

### Edge Cases to Test
- Clicking on cell with no activity
- Logging near activity boundaries (start/end date)
- Multiple logs on same activity
- Rapid save attempts
- Permissions denied scenarios
- Camera unavailable (simulator)
- Gallery with no photos
- Very long notes (500+ characters)
- Large image files
