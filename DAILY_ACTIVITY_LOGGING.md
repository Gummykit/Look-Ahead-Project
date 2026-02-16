# Daily Activity Logging Feature

## Overview

The Daily Activity Logging feature allows contractors and construction teams to document their daily work activities directly within the timechart. Users can add notes, descriptions, and photos for each activity on specific dates, creating a comprehensive work documentation system.

## Features

### 1. **Daily Log Modal**
- Opens when a user long-presses (500ms hold) on an activity cell in the timechart
- Displays activity details including:
  - Activity name
  - Subcontractor name
  - Date (formatted: Day, Month Date, Year)
  - Floor level with color indicator

### 2. **Work Notes**
- Multi-line text input field for detailed work descriptions
- Required field (at least one character must be entered)
- Supports up to 6 visible lines with scrollable content
- Placeholder: "Enter work notes, progress, observations, etc."

### 3. **Photo Documentation**
- Add up to 5 construction photos per day/activity combination
- **Current Status**: Image picker integration placeholder
- **Visual Features**:
  - Image grid layout (3 columns)
  - Thumbnail preview of uploaded images
  - Remove button (✕) for each image
  - "Add Photo" button with dashed border
  - Maximum images notification when limit reached

### 4. **Visual Indicators**
- **Green dot indicator** (🟢): Small green circle appears in the bottom-right corner of cells that have daily logs
- Helps contractors quickly identify which days have documentation
- Non-intrusive and doesn't interfere with activity bars

## User Interaction Flow

### Step 1: Open Daily Log Modal
```
User long-presses (holds finger for 500ms) on an activity cell
↓
Daily Activity Log modal appears
```

### Step 2: Fill in Work Notes
```
Enter detailed description of work completed
- Progress made
- Observations
- Issues encountered
- Materials used
- Weather conditions
- etc.
```

### Step 3: Add Photos (Optional)
```
Click "+ Add Photo" button
→ Image picker opens (future implementation)
→ Select construction photos
→ Photos appear in grid preview
→ Remove photos as needed (up to 5 total)
```

### Step 4: Save
```
Click "Save" button
↓
Daily log saved to project
↓
Green indicator appears on cell
↓
Modal closes with success message
```

## Data Structure

### DailyActivityLog Interface
```typescript
interface DailyActivityLog {
  id: string;              // Unique identifier
  activityId: string;      // Reference to activity
  date: Date;              // Log date
  notes: string;           // Work description
  imageUris: string[];     // Array of image file paths/URIs
  createdAt: Date;         // Creation timestamp
  updatedAt: Date;         // Last modification timestamp
}
```

### Storage
- Daily logs are stored in `timechart.dailyActivityLogs[]`
- Integrated with AsyncStorage persistence
- Automatic serialization/deserialization of dates
- Dates normalized to midnight UTC for consistency

## Implementation Details

### Event Handlers

**`handleOpenDailyLog(activity, cellDate)`**
- Opens the daily log modal
- Checks for existing logs for the activity/date combination
- Pre-fills form if log exists
- Initializes empty form if new

**`handleSaveDailyLog()`**
- Validates notes field (must have content)
- Calls `onAddOrUpdateDailyLog` callback
- Resets form state
- Shows success alert
- Closes modal

**`handleAddImage()`**
- Currently shows placeholder alert
- Future: Integrate expo-image-picker
- Prevents adding more than 5 images

**`handleRemoveImage(index)`**
- Removes image from the list by index
- Updates state immediately

### Memoization & Performance
- Uses React.useMemo for optimized rendering
- Checks for existing logs efficiently
- Prevents unnecessary re-renders

## Visual Design

### Color Scheme
- Modal background: Semi-transparent black (#000000CC)
- Log info section: Light blue (#F0F8FF) with left blue border
- Helper text: Gray italic text (#666)
- Add photo button: Dashed blue border on light blue background
- Log indicator: Green dot (#4CAF50)

### Layout
- Full-height scrollable modal
- Responsive grid for image preview (3 columns)
- Properly spaced form sections
- Touch-friendly buttons and inputs

## Future Enhancements

### 1. **Image Picker Integration**
```typescript
// When available, replace handleAddImage placeholder with:
import * as ImagePicker from 'expo-image-picker';

const handleAddImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.cancelled && result.assets) {
    const imageUri = result.assets[0].uri;
    if (dailyLogImages.length < 5) {
      setDailyLogImages([...dailyLogImages, imageUri]);
    }
  }
};
```

### 2. **Camera Integration**
- Add option to take photos directly with device camera
- Store with timestamp and location metadata

### 3. **Daily Log Viewer**
- Create a separate view to browse all logs for an activity
- Filter by date range
- Export logs as PDF or image gallery

### 4. **Weather Tracking**
- Add weather condition field
- Auto-detect location and weather API integration
- Historical weather data reference

### 5. **Time Tracking**
- Track work hours for each day
- Calculate productivity metrics
- Overtime tracking

### 6. **Notifications**
- Reminder to log work at end of day
- Sync status notifications
- Offline mode with sync queue

### 7. **Analytics Dashboard**
- Work progress timeline
- Photo gallery view
- Statistics and reports
- Team productivity analytics

## Installation Notes

### Current Requirements
```json
{
  "expo": "latest",
  "react-native": "latest",
  "react": "latest"
}
```

### Future Dependencies
```bash
# When implementing image picker
expo install expo-image-picker

# When implementing camera
expo install expo-camera

# When implementing weather
npm install react-native-weather-api
```

## Testing Checklist

- [ ] Modal opens on long-press
- [ ] Existing logs pre-fill correctly
- [ ] Notes field is required
- [ ] Can add up to 5 images
- [ ] Remove image button works
- [ ] Can't add more than 5 images
- [ ] Save button calls handler
- [ ] Green indicator shows after save
- [ ] Modal closes on back button
- [ ] Modal closes on outside press
- [ ] Data persists after close
- [ ] Form resets on new log

## Troubleshooting

### Modal doesn't open
- Check that activity is on a working day (not weekend/holiday)
- Verify long-press duration (500ms)
- Check console for errors

### Images not persisting
- Ensure image URIs are valid
- Check storage permissions
- Verify AsyncStorage is working

### Form resets unexpectedly
- Check if component is re-rendering
- Verify state management
- Look for duplicate state handlers

## API Reference

### Props
```typescript
onAddOrUpdateDailyLog: (
  activityId: string,
  date: Date,
  notes: string,
  imageUris: string[]
) => void

onRemoveDailyLog: (logId: string) => void
```

### State Variables
```typescript
showDailyLogModal: boolean
selectedActivityForLog: Activity | null
selectedLogDate: Date | null
dailyLogNotes: string
dailyLogImages: string[]
```

## Support

For issues or feature requests related to daily activity logging, please check:
1. Component: `UnifiedTimeChartEditor.tsx`
2. Types: `types/index.ts` (DailyActivityLog interface)
3. Storage: `utils/storage.ts` (Persistence layer)
4. Editor: `app/editor.tsx` (Handler functions)
