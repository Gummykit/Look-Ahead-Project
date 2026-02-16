# Look Ahead App - Construction Timechart Editor

## 📋 Quick Overview

This is a **React Native Expo** application for managing construction project timelines. It provides an interactive timeline editor where you can:

- ✅ Create and manage activities with drag-and-drop scheduling
- ✅ Track subcontractors with color-coded floor levels
- ✅ Log daily activity progress with notes and photos
- ✅ Manage public holidays (non-working days)
- ✅ Visual indicators for logged activities and holidays

---

## 🎯 Latest Update

### Double-Tap Feature (Replacing Long-Press)

The long-press interaction (500ms hold) has been replaced with **double-tap functionality** for better UX:

**Before:** Long-press (hold for 500ms) on a cell to open daily log modal
**Now:** Double-tap (quick double-click) on a cell to open daily log modal

**Implementation Details:**
- Double-tap detection window: 300ms between taps
- Works on all activity cells with visual indicators
- More responsive and intuitive interaction

**Technical Changes:**
- Added `handleCellDoubleTab()` function to detect double-taps
- Changed from `onLongPress` to `onPress` event handler
- Uses state tracking (`lastTapTime`, `lastTappedCell`) to detect rapid consecutive taps
- Cell key includes activity ID and day index for accurate tracking

---

## 🚀 How to Use

### Daily Activity Logging

1. **Open a Project:**
   - Navigate to the timechart view with activities displayed

2. **Access Daily Log:**
   - **Double-tap** any activity cell (the colored boxes) to open the daily log modal
   - Only works on active working days (not holidays/weekends)

3. **Log Activity Details:**
   - Enter work notes in the text field (required)
   - Add up to 5 photos by tapping "Add Image"
   - Tap "Save" to persist the log

4. **Visual Indicator:**
   - A small green dot appears in the bottom-right corner of logged cells
   - Indicates that daily notes have been recorded for that day

### Managing Activities

- **Create Activity:** Use the "Add Activity" button to create new tasks
- **Drag to Reschedule:** Click and drag activity indicators to change dates
- **Delete Activity:** Tap the ✕ button next to activity name
- **View Details:** Activities show contractor/floor level information

### Managing Holidays

- **Add Holiday:** Enter holiday name and date in the "Add Holiday" section
- **Delete Holiday:** Remove holidays from the list
- **Visual Indication:** Holiday cells are colored #FFE0E0 (light red)
- **Behavior:** Activities don't show on holiday or weekend cells

---

## 📁 Project Structure

```
components/
  └── UnifiedTimeChartEditor.tsx    # Main component (1746 lines)
      ├── Timechart rendering
      ├── Activity management
      ├── Drag-and-drop logic
      ├── Daily logging modal
      └── Double-tap detection

types/
  └── index.ts                      # TypeScript interfaces

utils/
  ├── dateUtils.ts                  # Date calculation functions
  └── storage.ts                    # AsyncStorage helpers

app/
  └── editor.tsx                    # Main screen/navigation
```

---

## 🎨 Key Features

### Timechart Grid
- Responsive date columns
- Month and day headers
- Activity rows with floor level colors
- Drag-and-drop rescheduling

### Daily Logging Modal
- Activity name and date display
- Multi-line notes input
- Photo gallery (up to 5 images)
- Save/Cancel buttons
- Existing log retrieval

### Visual Indicators
- **Activity Indicators:** Colored boxes showing active periods
- **Log Indicator:** Green dot (8x8px) showing logged days
- **Holidays:** Light red background (#FFE0E0)
- **Weekends:** Gray background (#F0F0F0)
- **Drag State:** Reduced opacity during dragging

### Cell Layout
- Each cell: 60px height × 50px width
- Month headers: 40px height
- Day headers: 50px height
- Centered content with flexbox alignment

---

## 🛠️ Technical Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **State Management:** React Hooks (useState, useMemo)
- **Storage:** AsyncStorage (async persistence)
- **Styling:** StyleSheet.create() with 85+ styles
- **Gestures:** Native responder system + TouchableOpacity

---

## 📝 Recent Bug Fixes

### Cell Visibility Issue (Fixed)
- **Problem:** Cells were moving upwards, making them barely visible
- **Cause:** Missing explicit height constraints on cells
- **Solution:** Added `height: 60` and `minHeight: 60` to dateCell styling

### Holiday Date Display (Fixed)
- **Problem:** Holidays appeared one day earlier than entered
- **Cause:** Using `new Date(string)` which doesn't respect YYYY-MM-DD format
- **Solution:** Manual date parsing using split and map functions

### Activity Creation (Fixed)
- **Problem:** Same-day activities couldn't be created
- **Cause:** Date comparison using `>=` instead of `>`
- **Solution:** Changed to `start > end` for proper validation

---

## 🔍 How Double-Tap Works

The double-tap detection uses a simple timing mechanism:

```typescript
handleCellDoubleTab(activity, currentDate, cellKey) {
  const now = Date.now();
  const DOUBLE_TAP_DELAY = 300; // milliseconds

  if (lastTappedCell === cellKey && now - lastTapTime < DOUBLE_TAP_DELAY) {
    // Double-tap detected! Open daily log
    handleOpenDailyLog(activity, currentDate);
    resetState();
  } else {
    // First tap or different cell
    recordTapTime();
  }
}
```

**Key Points:**
- Tracks time between taps on the same cell
- 300ms window to complete the double-tap
- Resets if taps are on different cells
- Doesn't interfere with drag-and-drop gestures

---

## 🎯 Development Notes

### Important Constants
- `DAY_WIDTH = 50` pixels
- `ACTIVITY_LABEL_WIDTH = 120` pixels
- `CONTRACTOR_LABEL_WIDTH = 120` pixels
- `DOUBLE_TAP_DELAY = 300` milliseconds

### State Variables for Double-Tap
- `lastTapTime`: Timestamp of last tap
- `lastTappedCell`: Cell key of last tapped cell

### Cell Height Constants
- Date cells: 60px
- Day header: 50px
- Month header: 40px
- Activity row: 60px

---

## ✨ Future Enhancements

Potential improvements:
- Photo picker integration (expo-image-picker)
- Offline sync for daily logs
- Export timeline as PDF
- Activity template library
- Subcontractor availability calendar
- Budget tracking per activity
- Resource allocation views

---

## 📞 Support

For issues or questions:
1. Check the type definitions in `types/index.ts`
2. Review the main component: `UnifiedTimeChartEditor.tsx`
3. Check date utilities in `utils/dateUtils.ts`
4. Verify storage operations in `utils/storage.ts`

---

**Last Updated:** February 15, 2026
**Version:** 2.2.0 (Double-Tap UI, Cell Visibility Fix, Bug Fixes)
