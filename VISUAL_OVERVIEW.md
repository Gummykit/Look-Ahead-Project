# Daily Activity Logging - Visual Overview

## 🎬 User Interface Flow

### Step 1: Identify Activity Cell to Log
```
┌─────────────────────────────────────────┐
│          TIMECHART GRID                 │
├─────────────────────────────────────────┤
│ Activity │ Mon │ Tue │ Wed │ Thu │ Fri │
├─────────┼─────┼─────┼─────┼─────┼─────┤
│Excavate │ [██] │ [██] │ [██] │ [  ] │ [  ] │
├─────────┼─────┼─────┼─────┼─────┼─────┤
│Concrete │ [  ] │ [  ] │ [██] │ [██] │ [██] │
└─────────┴─────┴─────┴─────┴─────┴─────┘

Legend:
[██] = Activity bar (click to log)
[🟢] = Has daily log (green indicator)
[  ] = No activity / non-working day
```

### Step 2: Long-Press Opens Modal
```
User holds finger on activity bar for 500ms
              ↓
        ┌──────────────────┐
        │   DAILY ACTIVITY │
        │      LOG MODAL   │
        └──────────────────┘
              ↓
        Modal slides in
        (smooth animation)
```

## 📋 Modal Layout

```
┌────────────────────────────────────────┐
│  ← Back              Daily Activity Log │ Save  
├────────────────────────────────────────┤
│ ┌──────────────────────────────────┐   │
│ │ ACTIVITY INFO (Blue Box)         │   │
│ ├──────────────────────────────────┤   │
│ │ Activity: Foundation Excavation  │   │
│ │ Subcontractor: BuildCorp Ltd     │   │
│ │ Date: Wednesday, February 15, 2026
│ │ 🟨 Floor Level: Ground Floor     │   │
│ └──────────────────────────────────┘   │
│                                         │
│ WORK NOTES *                            │
│ Describe the construction work...       │
│ ┌──────────────────────────────────┐   │
│ │                                  │   │
│ │ Completed excavation of plot...  │   │
│ │ Weather: Sunny, 25°C             │   │
│ │ Materials: 2 tons of gravel...   │   │
│ │                                  │   │
│ └──────────────────────────────────┘   │
│                                         │
│ WORK PHOTOS                             │
│ Add photos of the construction...       │
│ ┌────────┬────────┬────────┐           │
│ │ Photo1 │ Photo2 │ Photo3 │           │
│ │  [✕]   │  [✕]   │  [✕]   │           │
│ └────────┴────────┴────────┘           │
│         + Add Photo                      │
│                                         │
└────────────────────────────────────────┘
```

## 🎨 Color Scheme

```
┌────────────────────────────────────┐
│ MODAL BACKGROUND                   │
│ Color: #000000CC (Semi-transparent)│
│ Creates dark overlay               │
└────────────────────────────────────┘
        ↓
┌────────────────────────────────────┐
│ INFO CONTAINER                     │
│ Background: #F0F8FF (Light Blue)   │
│ Left Border: #0066CC (Dark Blue)   │
│ ┌────────────────────────────────┐ │
│ │ Activity: Foundation Excavation │ │
│ │ Subcontractor: BuildCorp Ltd    │ │
│ │ Date: Wed, Feb 15, 2026         │ │
│ │ Floor Level: Ground Floor       │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ NOTES INPUT                        │
│ Text: #333 (Dark Gray)             │
│ Placeholder: #999 (Light Gray)     │
│ Multi-line, 6+ lines visible       │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ IMAGE GRID                         │
│ 3 columns, equal spacing           │
│ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │Image1│ │Image2│ │Image3│       │
│ │[✕]   │ │[✕]   │ │[✕]   │       │
│ └──────┘ └──────┘ └──────┘       │
│                                    │
│ ┌─────────────────────────────┐   │
│ │ + Add Photo (Dashed Blue)   │   │
│ └─────────────────────────────┘   │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ BUTTONS                            │
│ Color: #0066CC (Blue)              │
│ Text: White (#FFF)                 │
│ ← Back      [Save]                 │
└────────────────────────────────────┘
```

## 📱 Responsive Layout

### Phone (Portrait)
```
Full screen modal
├─ Header (40px)
├─ ScrollView content
│  ├─ Info box
│  ├─ Notes input (120px min)
│  ├─ Image grid (3 cols)
│  └─ Add photo button
└─ Bottom spacing (100px)
```

### Tablet (Landscape)
```
Centered modal (max-width 600px)
├─ Wider columns
├─ More image previews
├─ Adjusted spacing
└─ Better text readability
```

## ✨ Visual Indicators

### Active Cell with Log
```
┌──────────────────┐
│  ACTIVITY BAR    │
│  [Color block]   │
│          [🟢]    │  ← Green indicator
│                  │     (8px circle)
└──────────────────┘
     Bottom-right corner
     Shows log exists
```

### Cell States
```
Working Day, No Log        Working Day, Has Log
┌──────────────────┐       ┌──────────────────┐
│ [Activity Bar]   │       │ [Activity Bar]   │
│ (Floor color)    │       │ (Floor color)    │
└──────────────────┘       │          [🟢]    │
                            └──────────────────┘

Weekend                    Holiday
┌──────────────────┐       ┌──────────────────┐
│ (Gray bg)        │       │ (Light pink bg)  │
│ No activity      │       │ No activity      │
│                  │       │                  │
└──────────────────┘       └──────────────────┘
     #F0F0F0                    #FFE0E0
```

## 🎯 Touch Interactions

### Long-Press Gesture
```
Finger down on activity bar
         ↓
Hold for 500ms
(visual feedback: slight opacity change)
         ↓
Finger up after 500ms
         ↓
Modal opens smoothly
(slide in from bottom)
```

### Modal Interactions
```
Click Save                  Click Back
    ↓                           ↓
Validate                   Discard changes
    ↓                           ↓
Save to storage             Close modal
    ↓                           ↓
Show success alert          (no save)
    ↓
Close modal
    ↓
Green indicator appears
```

### Image Management
```
Tap "+ Add Photo"          Tap "✕" on image
        ↓                          ↓
Image picker opens         Remove from grid
        ↓                          ↓
Select photo               Update preview
        ↓                          ↓
Add to grid                Re-render
(max 5)                    (update count)
```

## 📊 Data Flow Diagram

```
┌──────────────────┐
│  User Interface  │
│  (Long-press)    │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────┐
│ handleOpenDailyLog()     │
│ - Set selected activity  │
│ - Set selected date      │
│ - Query existing log     │
│ - Pre-fill or clear form │
│ - Show modal             │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────┐
│  Daily Log Modal │
│  (User enters)   │
│  - Notes         │
│  - Images        │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────┐
│ handleSaveDailyLog()     │
│ - Validate notes         │
│ - Call parent callback   │
│ - Reset form             │
│ - Show success alert     │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ onAddOrUpdateDailyLog()  │
│ (in editor.tsx)          │
│ - Create log object      │
│ - Update timechart state │
│ - Call storage.save()    │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ AsyncStorage.setItem()   │
│ (in utils/storage.ts)    │
│ - Serialize dates        │
│ - Save to device         │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ Component Re-render      │
│ - Show green indicator   │
│ - Update log preview     │
│ - Modal closes           │
└──────────────────────────┘
```

## 🔄 State Management

```
Component State:
┌────────────────────────────────────┐
│ showDailyLogModal: boolean         │
│ selectedActivityForLog: Activity   │
│ selectedLogDate: Date              │
│ dailyLogNotes: string              │
│ dailyLogImages: string[]           │
└────────────────────────────────────┘
         ↓
    Triggers
         ↓
┌────────────────────────────────────┐
│ UI Re-render                       │
│ - Modal visibility                 │
│ - Form content                     │
│ - Image grid                       │
│ - Indicators                       │
└────────────────────────────────────┘
```

## 🎬 Animation Flow

### Modal Open
```
Initial: Y = screen height
         ↓ (300ms slide up animation)
Final:   Y = 0 (modal visible)
         ↓
         Content visible
```

### Modal Close
```
Initial: Y = 0 (modal visible)
         ↓ (300ms slide down animation)
Final:   Y = screen height
         ↓
         Modal hidden
```

## 📱 Responsive Breakpoints

### Mobile (320px - 480px)
```
- Full screen modal
- Single column layout
- Smaller buttons
- Compact spacing
```

### Tablet (481px - 768px)
```
- Max-width modal (600px)
- Centered on screen
- Larger text
- More spacing
```

### Desktop (769px+)
```
- Consistent modal size
- Optimal readability
- Touch-friendly controls
- Professional layout
```

## 🎓 Visual Cues

### Success State
```
┌─────────────────────────┐
│  ✓ Success              │
│  Daily log saved        │
│  successfully          │
└─────────────────────────┘
     (Alert appears)
```

### Error State
```
┌─────────────────────────┐
│  ⚠ Error                │
│  Please enter notes     │
│  for the daily log     │
└─────────────────────────┘
```

### Loading State
```
Enter notes...
    ↓
Press Save
    ↓
[Saving...]
    ↓
✓ Saved!
    ↓
Modal closes
    ↓
Green indicator appears
```

## 🔍 Accessibility Features

- **Touch Targets**: 44px minimum (standard mobile)
- **Text Size**: 12px minimum (readable)
- **Color Contrast**: WCAG AA compliant
- **Labels**: Clear and descriptive
- **Feedback**: Visual and haptic alerts
- **Keyboard**: Form inputs properly labeled

---

This visual guide helps understand the Daily Activity Logging feature at a glance. For detailed information, see the other documentation files.
