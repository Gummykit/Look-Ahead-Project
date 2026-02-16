# Daily Activity Logging - Implementation Guide

## Technical Overview

The Daily Activity Logging feature is a comprehensive work documentation system integrated into the timechart component. It allows contractors to log daily work progress with notes and photos.

## Architecture

### Component Hierarchy
```
UnifiedTimeChartEditor (Main Timechart Component)
├── renderDateCells()
│   ├── TouchableOpacity wrapper (long-press handler)
│   ├── Activity indicator bars
│   └── Log indicator dot (🟢)
└── Daily Activity Log Modal
    ├── Activity Info Section
    ├── Work Notes Input
    ├── Image Gallery
    └── Control Buttons
```

### State Management

#### Modal Control States
```typescript
const [showDailyLogModal, setShowDailyLogModal] = useState(false);
// Controls visibility of the daily log modal
```

#### Data States
```typescript
const [selectedActivityForLog, setSelectedActivityForLog] = useState<Activity | null>(null);
// Currently selected activity for logging

const [selectedLogDate, setSelectedLogDate] = useState<Date | null>(null);
// Date of the daily log entry

const [dailyLogNotes, setDailyLogNotes] = useState('');
// Work notes content

const [dailyLogImages, setDailyLogImages] = useState<string[]>([]);
// Array of image URIs (max 5)
```

## Event Handlers

### 1. `handleOpenDailyLog(activity: Activity, cellDate: Date)`

**Purpose**: Opens the daily log modal and pre-fills existing data if available

**Flow**:
```
Input: Activity object, Cell date
  ↓
Set selected activity and date
  ↓
Check for existing log (query dailyActivityLogs array)
  ↓
If exists: Pre-fill notes and images
If new: Clear form fields
  ↓
Show modal
```

**Code**:
```typescript
const handleOpenDailyLog = (activity: Activity, cellDate: Date) => {
  setSelectedActivityForLog(activity);
  setSelectedLogDate(cellDate);
  
  // Query existing log
  const existingLog = timechart.dailyActivityLogs?.find(
    log => log.activityId === activity.id && 
           new Date(log.date).toDateString() === cellDate.toDateString()
  );
  
  // Pre-fill or clear
  if (existingLog) {
    setDailyLogNotes(existingLog.notes);
    setDailyLogImages(existingLog.imageUris || []);
  } else {
    setDailyLogNotes('');
    setDailyLogImages([]);
  }
  
  setShowDailyLogModal(true);
};
```

### 2. `handleSaveDailyLog()`

**Purpose**: Saves the daily log to persistent storage

**Validation**:
- Activity and date are present
- Notes field is not empty

**Flow**:
```
Validate inputs
  ↓
Call onAddOrUpdateDailyLog callback
  ↓
Reset form state
  ↓
Show success alert
  ↓
Close modal
```

**Code**:
```typescript
const handleSaveDailyLog = () => {
  if (!selectedActivityForLog || !selectedLogDate) {
    Alert.alert('Error', 'Missing activity or date information');
    return;
  }

  if (!dailyLogNotes.trim()) {
    Alert.alert('Error', 'Please enter some notes for the daily log');
    return;
  }

  onAddOrUpdateDailyLog(
    selectedActivityForLog.id,
    selectedLogDate,
    dailyLogNotes.trim(),
    dailyLogImages
  );

  // Reset and close
  setShowDailyLogModal(false);
  setSelectedActivityForLog(null);
  setSelectedLogDate(null);
  setDailyLogNotes('');
  setDailyLogImages([]);
  
  Alert.alert('Success', 'Daily log saved successfully');
};
```

### 3. `handleAddImage()`

**Current Status**: Placeholder implementation

**Future Implementation** (with expo-image-picker):
```typescript
const handleAddImage = async () => {
  if (dailyLogImages.length >= 5) {
    Alert.alert('Maximum', 'You can only add up to 5 images');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.cancelled && result.assets) {
    setDailyLogImages([...dailyLogImages, result.assets[0].uri]);
  }
};
```

### 4. `handleRemoveImage(index: number)`

**Purpose**: Remove an image from the gallery

**Code**:
```typescript
const handleRemoveImage = (index: number) => {
  setDailyLogImages(prevImages => 
    prevImages.filter((_, i) => i !== index)
  );
};
```

## UI Components

### Modal Structure

#### Header
- Back button (closes without saving)
- Title: "Daily Activity Log"
- Save button (saves and closes)

#### Activity Info Section
```typescript
{selectedActivityForLog && selectedLogDate && (
  <View style={styles.logInfoContainer}>
    <View style={styles.logInfoRow}>
      <Text style={styles.logLabel}>Activity:</Text>
      <Text style={styles.logValue}>{selectedActivityForLog.name}</Text>
    </View>
    // Additional rows: Subcontractor, Date, Floor Level
  </View>
)}
```

#### Notes Section
- Label: "Work Notes *"
- Multi-line TextInput (6 lines minimum)
- Required field (marked with *)
- Placeholder text guides user

#### Images Section
- Label: "Work Photos"
- Image grid (3 columns)
- Add Photo button (dashed border)
- Max 5 images notification
- Remove button (✕) on each image

### Styles Reference

```typescript
// Modal styling
modalBackground: {
  flex: 1,
  backgroundColor: '#000000CC', // Semi-transparent overlay
},

// Activity info
logInfoContainer: {
  backgroundColor: '#F0F8FF',
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
  borderLeftWidth: 4,
  borderLeftColor: '#0066CC',
},

// Image grid
imageGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
  marginBottom: 16,
},

imageContainer: {
  width: '32%', // 3 columns
  aspectRatio: 1,
  borderRadius: 8,
  overflow: 'hidden',
},

// Log indicator
logIndicator: {
  position: 'absolute',
  bottom: 2,
  right: 2,
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#4CAF50', // Green
},
```

## Data Flow Integration

### 1. User Interaction → Handler
```
User long-presses cell
  ↓
handleOpenDailyLog triggered
  ↓
Modal state updated
  ↓
Form pre-filled
```

### 2. Handler → Parent Component
```
handleSaveDailyLog called
  ↓
onAddOrUpdateDailyLog callback invoked
  ↓
Parent (editor.tsx) processes update
  ↓
Storage layer saves data
```

### 3. Storage → Display
```
AsyncStorage.setItem updates
  ↓
TimeChartData.dailyActivityLogs array updates
  ↓
Component re-renders
  ↓
Log indicators appear on cells
```

## Long-Press Implementation

### TouchableOpacity Wrapper
```typescript
<TouchableOpacity
  onLongPress={() => shouldShowActivity && handleOpenDailyLog(activity, currentDate)}
  delayLongPress={500}  // 500ms hold required
  activeOpacity={0.6}   // Visual feedback
>
  {/* Activity cell content */}
</TouchableOpacity>
```

**Key Points**:
- Only works on cells showing activity (`shouldShowActivity`)
- 500ms minimum hold time
- Visual feedback when pressed (activeOpacity)
- Wraps around the inner View with gesture responders

## Log Indicator Logic

### Checking for Existing Logs
```typescript
const hasActivityLog = timechart.dailyActivityLogs?.some(
  log => log.activityId === activity.id && 
         new Date(log.date).toDateString() === currentDate.toDateString()
);

{hasActivityLog && (
  <View style={styles.logIndicator} />
)}
```

**Considerations**:
- Date comparison uses `toDateString()` for consistency
- Handles null/undefined dailyActivityLogs array
- Non-obtrusive visual indicator

## Callback Chain in editor.tsx

### Handler Implementation
```typescript
const handleAddOrUpdateDailyLog = (
  activityId: string,
  date: Date,
  notes: string,
  imageUris: string[]
) => {
  const logId = Math.random().toString(36).substr(2, 9);
  const newLog: DailyActivityLog = {
    id: logId,
    activityId,
    date,
    notes,
    imageUris,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  setTimechart(prev => ({
    ...prev,
    dailyActivityLogs: [
      ...(prev.dailyActivityLogs || []).filter(
        log => !(log.activityId === activityId && 
                 new Date(log.date).toDateString() === date.toDateString())
      ),
      newLog,
    ],
  }));

  // Persist to storage
  saveTimechart(newLog);
};
```

## Storage Integration

### Serialization (Save)
```typescript
// In utils/storage.ts - saveTimechart()
dailyActivityLogs: timechart.dailyActivityLogs.map(log => ({
  ...log,
  date: log.date.toISOString(),
  createdAt: log.createdAt.toISOString(),
  updatedAt: log.updatedAt.toISOString(),
})),
```

### Deserialization (Load)
```typescript
// In utils/storage.ts - getTimechart()
dailyActivityLogs: (data.dailyActivityLogs || []).map(log => ({
  ...log,
  date: new Date(log.date),
  createdAt: new Date(log.createdAt),
  updatedAt: new Date(log.updatedAt),
})),
```

## Performance Considerations

### Memoization
- Component memoizes date calculations
- Log indicator check is O(n) where n = daily logs
- Consider indexing by activityId for large datasets

### Optimization Opportunities
1. **Map-based lookup**: Store logs in Map for O(1) access
2. **Pagination**: Limit visible logs
3. **Virtual scrolling**: For large image grids
4. **Image compression**: Reduce stored image sizes

```typescript
// Proposed optimization
const logsByActivityAndDate = useMemo(() => {
  const map = new Map<string, DailyActivityLog>();
  timechart.dailyActivityLogs?.forEach(log => {
    const key = `${log.activityId}-${log.date.toDateString()}`;
    map.set(key, log);
  });
  return map;
}, [timechart.dailyActivityLogs]);

// Then use:
const hasActivityLog = logsByActivityAndDate.has(
  `${activity.id}-${currentDate.toDateString()}`
);
```

## Testing Strategy

### Unit Tests
```typescript
describe('Daily Activity Logging', () => {
  test('handleOpenDailyLog opens modal', () => {
    // Test modal visibility
  });

  test('handleSaveDailyLog validates notes', () => {
    // Test validation
  });

  test('handleRemoveImage removes correct index', () => {
    // Test array manipulation
  });
});
```

### Integration Tests
```typescript
describe('Daily Log Integration', () => {
  test('Daily log persists to storage', async () => {
    // Mock AsyncStorage
    // Add log
    // Verify saved
  });

  test('Log indicator appears after save', () => {
    // Render component
    // Add log
    // Check for indicator
  });
});
```

### Manual Testing
- [ ] Long-press opens modal
- [ ] Existing logs pre-fill
- [ ] Form validation works
- [ ] Images can be added (placeholder)
- [ ] Images can be removed
- [ ] Save works
- [ ] Modal closes
- [ ] Indicator appears
- [ ] Data persists

## Future Roadmap

### Phase 1 (Current)
- ✅ Daily log modal UI
- ✅ Notes input
- ✅ Image placeholder
- ✅ Data persistence

### Phase 2 (Next)
- [ ] Image picker integration
- [ ] Camera support
- [ ] Weather integration
- [ ] Time tracking

### Phase 3 (Advanced)
- [ ] Log viewer/gallery
- [ ] PDF export
- [ ] Analytics dashboard
- [ ] Team collaboration features

## Debugging Tips

### Modal Won't Open
```typescript
// Check:
1. Is the cell showing activity? (shouldShowActivity)
2. Is it a long-press (500ms+)?
3. Check console: console.log('Opening log for:', activity.id);
```

### Data Not Saving
```typescript
// Verify:
1. onAddOrUpdateDailyLog is defined
2. Notes field has content
3. Storage permission granted
4. Check AsyncStorage in DevTools
```

### Indicator Not Showing
```typescript
// Debug:
const hasActivityLog = timechart.dailyActivityLogs?.some(
  log => {
    console.log('Checking:', log.activityId, activity.id, 
                new Date(log.date).toDateString(), 
                currentDate.toDateString());
    return log.activityId === activity.id && 
           new Date(log.date).toDateString() === currentDate.toDateString();
  }
);
```

## References

- **Component**: `components/UnifiedTimeChartEditor.tsx`
- **Types**: `types/index.ts` (DailyActivityLog)
- **Storage**: `utils/storage.ts`
- **Editor**: `app/editor.tsx` (Handlers)
- **Documentation**: `DAILY_ACTIVITY_LOGGING.md`
