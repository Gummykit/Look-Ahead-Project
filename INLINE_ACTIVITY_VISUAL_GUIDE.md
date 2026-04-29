# 🎨 Inline Activity Creation - Visual Guide

## 📺 UI Progression

### Step 1: Initial State (List View)
```
╔════════════════════════════════════════════════════════════════╗
║ ACTIVITY     │ CONTRACTOR  │ DURATION │ Timeline               ║
╠════════════════════════════════════════════════════════════════╣
║ Excavation   │ Company A   │ [−] 7 [+]│ ░░░░░░░░░░            ║
║ Framing      │ Company B   │ [−] 5 [+]│ ░░░░░░░                ║
╠════════════════════════════════════════════════════════════════╣
║ ＋ Add Activity                                                 ║
║ (dashed border, clickable)                                     ║
╚════════════════════════════════════════════════════════════════╝
```

### Step 2: User Clicks "+ Add Activity"
```
Button transforms into form row:

╔════════════════════════════════════════════════════════════════╗
║ [Activity Name]│[Contractor▼]│[−] 7 [+] │ [✓ Add] [✕ Cancel]║
║  (focused)     │  Company A  │          │                    ║
╚════════════════════════════════════════════════════════════════╝

Ready for input!
```

### Step 3: User Types Activity Name
```
╔════════════════════════════════════════════════════════════════╗
║ [Foundation  ]│[Contractor▼]│[−] 7 [+] │ [✓ Add] [✕ Cancel]║
║  ↑ cursor    │               │          │                    ║
╚════════════════════════════════════════════════════════════════╝
```

### Step 4: User Clicks Contractor Dropdown
```
╔════════════════════════════════════════════════════════════════╗
║ [Foundation  ]│[Company B ▼]│[−] 7 [+] │ [✓ Add] [✕ Cancel]║
│               │  (changed)  │          │                    ║
╚════════════════════════════════════════════════════════════════╝

After clicking dropdown button, contractor cycles to next
```

### Step 5: User Adjusts Duration
```
Option A: Click [+] button
╔════════════════════════════════════════════════════════════════╗
║ [Foundation  ]│[Company B  ]│[−] 8 [+] │ [✓ Add] [✕ Cancel]║
│               │             │  ↑       │                    ║
╚════════════════════════════════════════════════════════════════╝

Option B: Click on "8" and type
╔════════════════════════════════════════════════════════════════╗
║ [Foundation  ]│[Company B  ]│[−] 14 [+]│ [✓ Add] [✕ Cancel]║
│               │             │   ↑      │                    ║
╚════════════════════════════════════════════════════════════════╝
```

### Step 6: User Clicks "✓ Add"
```
Form closes, activity appears in list:

╔════════════════════════════════════════════════════════════════╗
║ ACTIVITY     │ CONTRACTOR  │ DURATION │ Timeline               ║
╠════════════════════════════════════════════════════════════════╣
║ Excavation   │ Company A   │ [−] 7 [+]│ ░░░░░░░░░░            ║
║ Framing      │ Company B   │ [−] 5 [+]│ ░░░░░░░                ║
║ Foundation   │ Company B   │ [−] 14 [+]│                      ║ ← NEW!
╠════════════════════════════════════════════════════════════════╣
║ ＋ Add Activity                                                 ║
║ (ready for next activity)                                      ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🎯 Component Breakdown

### Activity Name Input
```
┌──────────────────┐
│ Activity name    │  ← TextInput field
│ [cursor here]    │
└──────────────────┘
  150px width
  36px height
  White background
  Gray border
```

**Features**:
- Placeholder text: "Activity name"
- Auto-focused when form appears
- Required field (validation needed)
- Works with keyboard input
- Can be cleared and retyped

---

### Contractor Dropdown
```
┌──────────────────────┐
│ Company A        ▼   │  ← Click ▼ to cycle
└──────────────────────┘
  200px width
  
Clicking ▼ cycles through:
Company A → Company B → Company C → Company A...
```

**Features**:
- Shows current contractor name
- Click dropdown button to cycle
- Shows next contractor in list
- Wraps around after last
- Starts with first by default

---

### Duration Stepper
```
┌─────────────────────┐
│ [−]  14  [+]        │  ← Control duration
│  ▲   ▲   ▲          │
│  └───┼───┘          │
│  Decrease Input Increase
└─────────────────────┘
  100px width
  
Actions:
[−] button: Duration decreases by 1
Input:      Type number directly
[+] button: Duration increases by 1
Minimum:    1 day
Maximum:    No limit
```

**Features**:
- Three controls: minus, input, plus
- Direct numeric input
- Real-time validation
- Minimum value: 1
- Blue buttons
- Light blue input background

---

### Action Buttons
```
┌──────────┐  ┌──────────┐
│ ✓ Add    │  │ ✕ Cancel │
└──────────┘  └──────────┘
  Green        Red
  Submit       Cancel
```

**Features**:
- [✓ Add]: Green button, submits form
- [✕ Cancel]: Red button, cancels form
- Clear visual distinction
- Easy to tap on mobile
- Keyboard accessible

---

## 📊 Layout Dimensions

```
FULL FORM ROW (Horizontal Layout)

┌─────────┬───────────┬─────────┬─────────────────────┐
│         │           │         │                     │
│  150px  │   200px   │  100px  │   Auto (buttons)    │
│         │           │         │                     │
└─────────┴───────────┴─────────┴─────────────────────┘

Activity  Contractor  Duration  Actions
Name
```

**Total Width**: 150 + 200 + 100 + buttons ≈ 480px+

**Responsive Behavior**:
- Small screen: Row may wrap
- Large screen: Row stays in single line
- Buttons always visible
- All fields accessible

---

## 🔄 State Transitions

```
START: Form Hidden
         ↓
         ├─ User clicks "+" → Form Visible
         │     ↓
         │     ├─ User fills form
         │     │     ↓
         │     │     ├─ User clicks "✓ Add" → Activity Created, Form Hidden
         │     │     └─ User clicks "✕ Cancel" → Form Hidden (no save)
         │     └─ (same as START)
         │
         └─ No Change
```

---

## 🎨 Color Scheme

```
Component          Color       Purpose
─────────────────────────────────────────
Input Fields       #FFF        White, clean
Input Border       #DDD        Gray, subtle
Duration Input BG  #F0F8FF     Light blue, highlight
Add Button         #4CAF50     Green, positive action
Cancel Button      #F44336     Red, negative action
Duration Buttons   #0066CC     Blue, primary color
Duration Text      #0066CC     Blue, matches button
Row Background     #FAFAFA     Off-white, subtle
Row Border Bottom  #E0E0E0     Light gray, divider
```

---

## 📱 Mobile vs Desktop

### Desktop View
```
╔══════════════════════════════════════════════════════════════╗
│ [Activity Name]│[Contractor▼]│[−] 7 [+]│[✓ Add] [✕ Cancel]│
│ <--- 150 ---> <--- 200 ---> <--- 100----> <---- auto ----→ │
╚══════════════════════════════════════════════════════════════╝
All visible in one row
```

### Mobile View
```
╔════════════════════════════════════════╗
│ [Activity Name.......................]  │
│ <----------- Full Width --------->    │
├════════════════════════════════════════┤
│ [Contractor▼]                          │
│ <----------- Full Width --------->    │
├════════════════════════════════════════┤
│ [−] 7 [+]                              │
│ <----------- Full Width --------->    │
├════════════════════════════════════════┤
│ [✓ Add]        [✕ Cancel]              │
│ <-- Split Width Left - Split Width Right
╚════════════════════════════════════════╝
Responsive stacking (can be implemented)
```

---

## ✨ Interaction Flows

### Flow 1: Complete Happy Path
```
1. See "+ Add Activity" button
   ↓
2. Click button
   ↓
3. Form row appears
   ↓
4. Type "Foundation"
   ↓
5. Current contractor is fine (no change needed)
   ↓
6. Adjust duration: Click [+] once → 8 days
   ↓
7. Click "✓ Add"
   ↓
8. Activity appears in list
   ↓
✅ SUCCESS: Activity created in 10 seconds
```

### Flow 2: Multiple Activities
```
Activity 1:
1. Click "+"
2. Type "Excavation"
3. Change contractor to Company B
4. Duration 10 days
5. Click "✓ Add"
   ↓
6. Form resets and reappears
7. Type "Foundation"
8. Keep Company B (already selected)
9. Duration stays 7 (OK)
10. Click "✓ Add"
   ↓
✅ SUCCESS: Two activities in 20 seconds
```

### Flow 3: Cancel/Undo
```
1. Click "+"
2. Type "Demolition"
3. Think: "Actually, don't want this"
4. Click "✕ Cancel"
   ↓
✅ SUCCESS: Form closed, nothing saved
   Button returns to normal state
```

---

## 🎯 Error States

### Missing Activity Name
```
User clicks "✓ Add" without entering name
         ↓
Alert appears: "Please enter activity name"
         ↓
Form stays open
User can continue editing
```

### Invalid Duration
```
User types "0" or negative number
         ↓
Duration input shows minimum (1)
         ↓
User can submit with duration 1
```

### Permission Denied
```
View-only user
         ↓
"+ Add Activity" button NOT visible
         ↓
Form never appears
         ↓
User sees: "No activities added yet"
```

---

## 🌈 Visual Hierarchy

### Importance (High to Low)
```
1. Activity Name Input
   └─ Most important, auto-focused, largest
   
2. Contractor Selection
   └─ Medium importance, clear dropdown
   
3. Duration Control
   └─ Important, but secondary
   
4. Action Buttons
   └─ Clear and prominent
   └─ Green (add) vs Red (cancel)
```

### Visual Emphasis
```
Primary Focus:   Activity Name (bright white, full focus)
Secondary Focus: Contractor (medium highlight)
Tertiary Focus:  Duration (smaller, numbers only)
Action Buttons:  Green/Red (clear intent)
```

---

## ♿ Accessibility

### Keyboard Navigation
```
Tab 1:  Activity Name input
Tab 2:  Contractor ▼ button  
Tab 3:  Duration [−] button
Tab 4:  Duration input field
Tab 5:  Duration [+] button
Tab 6:  ✓ Add button
Tab 7:  ✕ Cancel button
```

### Screen Reader
```
"Activity name input field, required"
"Contractor dropdown button"
"Duration decrease button"
"Duration input field"
"Duration increase button"
"Add button, green"
"Cancel button, red"
```

### Touch Targets
```
All buttons: Minimum 44px × 44px (iOS standard)
Input fields: 36px height minimum
Spacing: 4px minimum between elements
```

---

## 🎬 Animation (Optional)

### Form Appearance
```
Smooth fade-in (0.3s)
Slight slide-down from button
Activity name field gets focus
Keyboard may appear (mobile)
```

### Activity Creation
```
Form slides up and fades out (0.2s)
New activity slides in from bottom (0.3s)
Form resets and appears again
```

---

**Version**: 1.0  
**Date**: April 21, 2026  
**Status**: ✅ Production Ready

Visual guide complete! The inline form provides a clean, fast, and intuitive way to add activities! 🎉
