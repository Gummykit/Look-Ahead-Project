# Daily Activity Logging - Quick Start Guide

## What's New?

The Daily Activity Logging feature enables construction contractors to document their work directly within the timechart with notes and photos.

## How to Use

### 1. **Open Daily Log**
- Long-press (hold for 500ms) any activity bar in the timechart
- The "Daily Activity Log" modal will open

### 2. **View Activity Info**
The modal displays:
- **Activity Name**: Name of the construction activity
- **Subcontractor**: Name of the contractor/team
- **Date**: The specific date for this log entry
- **Floor Level**: With color indicator

### 3. **Add Work Notes**
- Enter detailed description of work completed today
- Examples:
  - "Completed foundation excavation 40%"
  - "Installed rebar in grid pattern"
  - "Weather: Clear, Temp: 25°C"
  - "Material: 5 tons of concrete delivered"
- **Required**: At least one character needed

### 4. **Add Photos** (Optional)
- Click **"+ Add Photo"** button
- Select construction work photos
- Can add up to **5 photos** per day/activity
- Remove any photo with the **✕** button
- Photos appear in a grid preview

### 5. **Save**
- Click **"Save"** button
- Success message appears
- Modal closes automatically
- **Green dot indicator** (🟢) appears on the cell

## Visual Indicators

### Green Dot 🟢
- Appears in bottom-right corner of activity cells
- Indicates a daily log has been saved for that day
- Helps quickly identify documented work days

## Tips & Tricks

✅ **Best Practices**
- Log work every day for better documentation
- Include photos for visual proof of progress
- Be specific in notes for project history
- Include weather and material information

⏱️ **Timing**
- Log at end of each working day
- Update existing logs if needed
- Long-press again to edit previous entries

📸 **Photos**
- Take clear, well-lit construction photos
- Include work context (before/after)
- Label complex work visually
- Maximum 5 photos per day/activity

## UI Elements

| Element | Function |
|---------|----------|
| Activity Info Box | Shows activity details (blue background) |
| Work Notes Field | Multi-line text input for descriptions |
| Add Photo Button | Opens image picker (dashed border) |
| Photo Grid | Shows thumbnail preview (3 columns) |
| Remove Button (✕) | Delete individual photos |
| Save Button | Save the daily log |
| Back Button | Close without saving |

## Data Stored

Each daily log includes:
- Activity ID
- Date
- Work notes
- Photo file paths/URIs
- Creation timestamp
- Last update timestamp

All data is automatically saved to your device storage.

## Integration with Timechart

- Works seamlessly with drag-and-drop activity scheduling
- Logs are linked to specific activities by ID
- Visible green indicators on cells with logs
- Data persists when you close and reopen the app

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal won't open | Make sure you're long-pressing an activity bar on a working day (not weekend/holiday) |
| Can't save | Check that you've entered notes in the text field |
| Photos not showing | Wait for image picker integration in next version |
| Data disappeared | Check that you clicked Save (not Back) |

## Next Update Plans

📅 **Coming Soon**
- Image picker integration with photo library
- Camera integration for direct photo capture
- Weather auto-detection
- Daily log viewer/gallery
- Export logs as PDF
- Analytics and reporting

---

**Need Help?** Refer to `DAILY_ACTIVITY_LOGGING.md` for detailed documentation.
