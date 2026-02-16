# Daily Activity Logging Feature

## Overview

The Daily Activity Logging feature allows construction contractors to document their work progress in real-time by clicking on activity cells in the timechart. Contractors can add detailed notes and attach multiple photos/images to track daily construction activities.

## Features

### 1. **Quick Access Modal**
- Click on any activity indicator (colored bar) in the timechart to open the daily log modal
- Modal displays relevant information:
  - Activity name and details
  - Subcontractor information
  - Floor level assignment
  - Selected date
  - Character count for notes

### 2. **Work Notes**
- Multi-line text input for detailed work descriptions
- Character counter to track note length
- Auto-populate existing notes if a log already exists for that day
- Supports detailed documentation of tasks completed

### 3. **Photo Management**
- **Take Photo**: Capture images directly using the device camera
- **Choose from Gallery**: Select existing images from the device's photo library
- **Image Grid Display**: View all attached images in a responsive 3-column grid
- **Image Removal**: Delete individual images with a single tap
- **Image Numbering**: Track the order of attached photos

### 4. **Permissions Handling**
- Automatic permission requests for camera and photo library access
- Clear error messages if permissions are denied
- Graceful fallback if operations fail

### 5. **Data Persistence**
- Logs are automatically saved to local storage
- Existing logs can be retrieved and edited
- All images are persisted with their URIs

### 6. **Visual Indicators**
- **Log Indicator Dot**: Small golden dot appears on activity cells with existing logs
- **Active Dot Design**: Differentiates logged cells from non-logged ones
- **Loading State**: Shows spinner while saving data

## User Workflow

### Step 1: Open Daily Log
```
1. Navigate to the timechart view
2. Locate the activity you want to log
3. Click on any colored indicator bar within the activity's date range
4. If it's a working day (not weekend/holiday), the modal opens
```

### Step 2: Add Work Notes
```
1. The notes field is pre-focused
2. Type detailed descriptions of work completed
3. See character count update in real-time
```

### Step 3: Capture/Add Photos
```
Option A - Take Photo:
1. Tap "📷 Take Photo" button
2. Grant camera permission if prompted
3. Capture the image
4. Image automatically adds to the grid

Option B - Choose from Gallery:
1. Tap "🖼️ Choose From Gallery" button
2. Grant photo library permission if prompted
3. Select image from available photos
4. Image automatically adds to the grid
```

### Step 4: Review & Save
```
1. Review added photos in the grid
2. Verify notes are complete
3. Tap "Save" button to persist the log
4. Success confirmation appears
5. Golden dot indicator appears on the cell
```

### Step 5: Edit Existing Logs
```
1. Click on a cell with an existing log (has golden dot)
2. Existing notes and images load into the modal
3. Edit notes or add/remove images
4. Tap "Save" to update
```

## Technical Implementation

### Components

#### DailyActivityLogModal.tsx
Main modal component with:
- Header with activity info and save button
- Date display with color-coded indicator
- Notes text input
- Photo action buttons (Take/Gallery)
- Image gallery with removal capability
- Info section with helpful hints
- Loading overlay during save

#### UnifiedTimeChartEditor.tsx Integration
- `handleCellPress()`: Opens modal for clicked cell
- `handleDailyLogSave()`: Saves log data via parent handler
- `getExistingLogForCell()`: Retrieves existing log for display
- Log indicator dots visible on logged cells

### Data Model

```typescript
interface DailyActivityLog {
  id: string;              // Unique identifier
  activityId: string;      // Links to specific activity
  date: Date;             // Log date (midnight UTC)
  notes: string;          // Work description
  imageUris: string[];    // Array of image URIs
  createdAt: Date;        // Creation timestamp
  updatedAt: Date;        // Last modification timestamp
}
```

### Storage
- Logs stored in `timechart.dailyActivityLogs` array
- Date serialization/deserialization handled by storage.ts
- Images persisted as file URIs

## Validation Rules

### Can Only Log On:
- ✅ Working days (Monday-Saturday)
- ✅ Non-holiday dates
- ✅ Dates within activity's date range

### Cannot Log On:
- ❌ Sundays (weekends)
- ❌ Public holidays
- ❌ Dates outside activity duration

### Save Requirements:
- ✅ At least one note OR one image required
- ✅ Non-empty notes (if provided)
- ✅ Valid image URIs (if provided)

## Styling

### Color Scheme
- **Header**: Light gray (#F5F5F5)
- **Active Buttons**: Teal (#45B7D1)
- **Remove Button**: Red (#FF6B6B)
- **Log Indicator**: Golden (#FFD700)
- **Info Section**: Light blue (#E3F2FD)

### Responsive Design
- Image grid: 3 columns on all screen sizes
- Adapts to different phone widths
- Maintains aspect ratios for images
- Smooth transitions and animations

## Permissions Required

### Android (manifest)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### iOS (Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to take construction photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to add work documentation</string>
```

## Error Handling

### Permission Denied
```
Alert: "Permission needed"
Message: "Camera permission is required" (or photo library)
Result: User returns to modal without changes
```

### Image Selection Failed
```
Alert: "Error"
Message: "Failed to pick image"
Action: User can retry
```

### Save Failed
```
Handled by parent component (editor.tsx)
Failed save shows appropriate error message
Data reverts to previous state
```

## Future Enhancements

1. **Image Compression**: Reduce file sizes before storage
2. **Cloud Upload**: Sync logs to cloud storage
3. **Team Sharing**: Share daily logs with team members
4. **Report Generation**: Export daily logs as PDF reports
5. **Offline Support**: Queue photos/notes when offline
6. **Search & Filter**: Find logs by date or keyword
7. **Ratings/Status**: Add work status (completed/pending/issues)
8. **Voice Notes**: Add audio documentation
9. **GPS Tagging**: Attach location data to logs
10. **Signature Capture**: Digital signatures for approval

## Performance Considerations

- Images loaded asynchronously to prevent UI blocking
- 3-column grid optimized for all device sizes
- Lazy loading of images in gallery view
- Efficient date calculations using memoization
- Minimal re-renders with proper React hooks usage

## Testing Checklist

- [ ] Open log modal from various activity cells
- [ ] Add notes only (no images)
- [ ] Add images only (no notes)
- [ ] Add both notes and multiple images
- [ ] Take photos with camera
- [ ] Select images from gallery
- [ ] Remove images from the grid
- [ ] Edit existing logs
- [ ] Test on devices without permissions
- [ ] Verify persistence across app restarts
- [ ] Confirm log indicators appear/disappear correctly
- [ ] Test with long notes (character limit)
- [ ] Verify prevented logging on holidays/weekends
