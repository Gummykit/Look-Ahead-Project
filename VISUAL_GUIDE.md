# Daily Activity Logging - Visual Guide

## User Interface Overview

### 1. Timechart View (Default State)

```
┌─────────────────────────────────────────────────────────────┐
│  PROJECT NAME • Company Name • Location                      │
├─────────────────────────────────────────────────────────────┤
│ [+ Activity] [+ Holiday] [+ Contractor] [+ Floor] [Manage]  │
├─────────────────────────────────────────────────────────────┤
│                      JANUARY 2026                            │
├─────────────────────────────────────────────────────────────┤
│ ACTIVITY       CONTRACTOR    Jan 5  6  7  8  9  10 11...    │
├─────────────────────────────────────────────────────────────┤
│ Excavation     ABC Corp     ┌──────────────────────────┐    │
│                             │    [Floor1 Color]        │    │
│                             └──────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│ Foundation     XYZ Inc      ┌──────────────────────────┐    │
│                             │ [Floor2 Color]           │ ◉  │
│                             └──────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 💡 Tap and hold an activity bar to change dates           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Legend:
[      ] = Activity bar (colored by floor level)
◉        = Log indicator (golden dot on logged cells)
```

### 2. Click Activity Bar to Open Modal

```
                    USER TAPS ACTIVITY BAR
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ✅ WORKING DAY        ❌ HOLIDAY/WEEKEND
            ✅ IN ACTIVITY RANGE  ❌ OUTSIDE RANGE
                    │                   │
                    ▼                   ▼
             MODAL OPENS         ERROR ALERT
```

### 3. Daily Logging Modal (Open State)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back                  EXCAVATION              Save ✓        │
│                    ABC Corp • Ground Floor                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Log Date                                                      │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Jan 08, 2026                                            │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 📝 Work Notes                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Completed foundation excavation for Building A.         │  │
│ │ Removed 250 cubic meters of soil. Weather was clear    │  │
│ │ with good visibility. All safety protocols followed.    │  │
│ │ No incidents reported.                                  │  │
│ │                                                          │  │
│ └─────────────────────────────────────────────────────────┘  │
│ 184 characters                                               │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 📸 Work Photos (2)                                          │
│ ┌──────────────┐ ┌──────────────┐                           │
│ │              │ │              │                           │
│ │   Photo 1    │ │   Photo 2    │                           │
│ │ [Remove ✕]   │ │ [Remove ✕]   │                           │
│ └──────────────┘ └──────────────┘                           │
│                                                               │
│ [📷 Take Photo]  [🖼️ Choose From Gallery]                   │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 💡 This log helps track daily progress and provides visual   │
│    documentation of construction work.                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 4. Photo Grid View (3 Columns)

```
With No Photos:
┌──────────────────────────────────────────────────────────────┐
│ No photos added yet                                          │
│ Take photos or upload images from your gallery to document  │
│ the work                                                      │
└──────────────────────────────────────────────────────────────┘

With Photos:
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│             │ │             │ │             │
│   Photo 1   │ │   Photo 2   │ │   Photo 3   │
│   [1]  ✕    │ │   [2]  ✕    │ │   [3]  ✕    │
└─────────────┘ └─────────────┘ └─────────────┘

┌─────────────┐ ┌─────────────┐
│             │ │             │
│   Photo 4   │ │   Photo 5   │
│   [4]  ✕    │ │   [5]  ✕    │
└─────────────┘ └─────────────┘

[✕] = Remove button (tap to delete)
[#] = Photo number in sequence
```

## User Actions & Transitions

### Path 1: Add New Log

```
TIMECHART VIEW
      │
      │ [User clicks activity cell]
      │
      ▼
DAILY LOG MODAL (Empty)
      │
      │ [User types notes]
      ├─ Character count updates
      │
      │ [User takes/selects photos]
      ├─ Images appear in grid
      ├─ Can remove photos individually
      │
      │ [User reviews data]
      │
      │ [User clicks Save]
      │
      ▼
DATA VALIDATED
      │ (notes OR images present)
      │
      ▼
LOADING SPINNER SHOWN
      │
      │ [Data saved to AsyncStorage]
      │
      ▼
MODAL CLOSES
      │
      ├─ Reset notes field
      ├─ Reset image array
      ├─ Clear form
      │
      ▼
SUCCESS ALERT SHOWS
      │ "Daily activity log saved successfully"
      │
      ▼
TIMECHART VIEW
      │
      └─ Golden dot appears on logged cell
```

### Path 2: Edit Existing Log

```
TIMECHART VIEW
      │ (with golden dot on cell)
      │
      │ [User clicks logged cell]
      │
      ▼
DAILY LOG MODAL (Pre-populated)
      │
      ├─ Existing notes loaded
      ├─ Existing photos loaded in grid
      │
      │ [User can modify]
      │
      │ [User clicks Save]
      │
      ▼
DATA VALIDATED
      │
      ▼
LOADING SPINNER SHOWN
      │
      │ [Data updated in AsyncStorage]
      │
      ▼
MODAL CLOSES
      │
      ▼
SUCCESS ALERT SHOWS
      │
      ▼
TIMECHART VIEW
      │
      └─ Golden dot remains on updated cell
```

### Path 3: Validation Errors

```
TIMECHART VIEW
      │
      │ [User clicks holiday/weekend cell]
      │
      ▼
ERROR ALERT
│ "Cannot Log"
│ "Daily logs can only be created on working days"
      │
      ▼
TIMECHART VIEW (Unchanged)

──────────────────────────────────

DAILY LOG MODAL
      │
      │ [User has no notes & no images]
      │
      │ [User tries to click Save]
      │
      ▼
SAVE BUTTON DISABLED (visual feedback)
      │
      ▼
ERROR ALERT
│ "Error"
│ "Please add notes or at least one image"
      │
      ▼
MODAL REMAINS OPEN
│ (User can add content)
```

## Visual Elements

### Activity Bars (Timechart)
```
Normal (No Log):          With Log:
┌──────────────┐          ┌──────────────┐
│              │          │       ◉      │
│ Floor Color  │          │ Floor Color  │
│              │          │              │
└──────────────┘          └──────────────┘
(Clickable)              (Golden dot = logged)

When Dragging:
┌──────────────┐
│              │
│ 70% Opacity  │
│              │
└──────────────┘
(Semi-transparent during drag)
```

### Cell Backgrounds (Based on Day Type)

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Working  │  │  Sunday  │  │ Holiday  │  │ Logged   │
│   Day    │  │ Weekend  │  │   Day    │  │   Day    │
│          │  │          │  │          │  │    ◉     │
│ #FFFFFF  │  │ #F0F0F0  │  │ #FFE0E0  │  │ #FFFFFF  │
│(White)   │  │ (Gray)   │  │ (Pink)   │  │(White)   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Modal States

```
HEADER STATE:
Active:  [← Back]  ACTIVITY NAME  [Save ✓]
Saving:  [← Back]  ACTIVITY NAME  [Saving...]
         (All disabled during save)

SAVE BUTTON STATE:
Enabled:  [Save ✓] (Blue text)
Disabled: [Save ✓] (Gray text, 50% opacity)
          (When no notes AND no images)
```

## Data Persistence Flow

```
┌─────────────────────────────────────────────┐
│ USER SAVES LOG                              │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ DailyActivityLogModal.onSave()              │
│ • notes: string                             │
│ • imageUris: string[]                       │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ UnifiedTimeChartEditor.handleDailyLogSave() │
│ • Extract activity ID                       │
│ • Get selected date                         │
│ • Pass to parent callback                   │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ editor.tsx.handleAddOrUpdateDailyLog()      │
│ • Create/update log object                  │
│ • Add to dailyActivityLogs array            │
│ • Update timechart state                    │
│ • Call saveTimechart()                      │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ storage.ts.saveTimechart()                  │
│ • Serialize dates to ISO strings            │
│ • Serialize image URIs                      │
│ • Store in AsyncStorage                     │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ DEVICE STORAGE                              │
│ ✓ Data persists across app restarts         │
└─────────────────────────────────────────────┘
```

## Component Relationships

```
┌──────────────────────────────────────────────────────┐
│ App.tsx                                              │
│ └─ Router                                            │
│    └─ [project]                                      │
│       └─ editor.tsx                                  │
│          │ (State: timechart with dailyActivityLogs)
│          │
│          ├─ UnifiedTimeChartEditor.tsx               │
│          │  ├─ Header (5 buttons)                   │
│          │  ├─ Timechart Grid                       │
│          │  │  └─ Activity Rows                     │
│          │  │     └─ Date Cells                     │
│          │  │        └─ Log Indicator Dots          │
│          │  │           (onClick → modal)           │
│          │  │                                        │
│          │  ├─ Various Modals                       │
│          │  │  (Holiday, Activity, etc.)            │
│          │  │                                        │
│          │  └─ DailyActivityLogModal.tsx ◄─ NEW    │
│          │     ├─ Header                            │
│          │     ├─ Date Display                      │
│          │     ├─ Notes Input                       │
│          │     ├─ Photo Controls                    │
│          │     └─ Image Gallery                     │
│          │                                           │
│          └─ Callbacks                               │
│             └─ onAddOrUpdateDailyLog()              │
│
└──────────────────────────────────────────────────────┘
```

## Responsive Design

```
PORTRAIT (Mobile)          LANDSCAPE (Mobile)
┌──────────────────┐      ┌──────────────────────────┐
│ Modal Header     │      │ Modal Header             │
├──────────────────┤      ├──────────────────────────┤
│                  │      │  Notes (wider)           │
│ Notes Section    │      │                          │
│ (Full width)     │      ├──────┬──────┬──────┐     │
│                  │      │Img 1 │Img 2 │Img 3 │     │
├──────────────────┤      │      │      │      │     │
│ Photo Buttons    │      ├──────┴──────┴──────┤     │
│ (2 columns)      │      │ Photo Buttons      │     │
├──────────────────┤      └────────────────────┘     │
│ Images (3 cols)  │
│ ┌──┬──┬──┐       │
│ │  │  │  │       │
│ └──┴──┴──┘       │
│                  │
└──────────────────┘

Mobile: 3-column image grid
Tablet: 3-column image grid (wider cells)
Both: Touch-friendly button sizes
```

## Color Reference

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Working Day | White | #FFFFFF | Standard cell |
| Weekend | Gray | #F0F0F0 | Sunday background |
| Holiday | Pink | #FFE0E0 | Holiday background |
| Log Indicator | Gold | #FFD700 | Logged cell marker |
| Primary Button | Teal | #45B7D1 | Action button |
| Danger Button | Red | #FF6B6B | Remove action |
| Header | Light Gray | #F5F5F5 | Section header |
| Info Box | Light Blue | #E3F2FD | Help text |

---

**This visual guide complements the technical documentation and helps understand the user interface and interaction flow.**
