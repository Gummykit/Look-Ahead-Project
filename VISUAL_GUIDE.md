# Visual Guide - Button Locations & Features

## Home Screen Layout

```
┌─────────────────────────────────────────┐
│  🔵 Status Bar                          │
├─────────────────────────────────────────┤
│                                         │
│  👤 John Contractor      🔧  Logout     │  <- USER HEADER (This Part)
│  Contractor                             │
│                                         │
├─────────────────────────────────────────┤
│ Construction Timechart                  │
│ Manage project schedules & activities   │  <- Page Title
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ 📋 Project 1                  ✕  │  │
│  │ Company Name                      │  │  <- Projects List
│  │ Location · 12-month duration      │  │    (Scrollable)
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ 📋 Project 2                  ✕  │  │
│  │ Company Name                      │  │
│  │ Location · 6-month duration       │  │
│  └──────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│                                    [+]  │  <- Create Button (Only if canCreate)
│                                         │
└─────────────────────────────────────────┘
```

---

## User Header (Top Section) - Close-Up

```
┌─────────────────────────────────────────┐
│                                         │
│  USER INFO        │  DEBUG BTN │  LOGOUT │
│                   │            │        │
│  👤 John          │   🔧       │ Logout │
│  Contractor       │  (Blue)    │ (Red)  │
│                   │            │        │
└─────────────────────────────────────────┘
     (Flex: 1)         (Fixed)    (Fixed)
```

---

## Button Details

### 🔧 Debug Button (Blue)
- **Location:** Top-right, 2nd button from right
- **Style:** Blue background (#0088CC)
- **Size:** Small, emoji-sized
- **Function:** Clear stored session
- **Action:** 
  1. Tap to open confirmation dialog
  2. Tap "Clear" to confirm
  3. Restart app to see login screen

### 🔴 Logout Button (Red)
- **Location:** Top-right, rightmost button
- **Style:** Red background (#FF4444)
- **Size:** Medium, wider than debug button
- **Text:** "Logout"
- **Function:** Sign out current user
- **Action:**
  1. Tap to open confirmation dialog
  2. Tap "Logout" to confirm
  3. Returns to login screen immediately

---

## Touch Areas & Tap Targets

```
User Header Area (Tappable):

┌─────────────────────────────────────┐
│                                     │
│ 👤 John        ┏━━━━┓  ┏━━━━━━━┓  │
│ Contractor     ┃ 🔧 ┃  ┃Logout ┃  │
│                ┗━━━━┛  ┗━━━━━━━┛  │
│                ▲        ▲          │
│           Tap here  Tap here       │
│                                     │
└─────────────────────────────────────┘
```

**Good tap targets:** Center of buttons
**Avoid:** Edges, outside the button bounds

---

## State Changes After Actions

### After Tapping Debug (🔧) Button

```
BEFORE:
┌──────────────────────────┐
│ 👤 Builder           🔧  │  <- Stored as 'builder'
│                  Logout   │
└──────────────────────────┘
│ Projects list (builder   │
│ view-only)               │
└──────────────────────────┘

CONFIRM "Clear" ↓

AFTER RESTART:
┌──────────────────────────┐
│ Username: [           ]  │
│ Password: [           ]  │  <- Login screen
│ Role: ◯ Contractor       │     (no stored session)
│       ◯ Architect        │
│       ◯ Builder          │
└──────────────────────────┘
```

### After Tapping Logout Button

```
BEFORE:
┌──────────────────────────┐
│ 👤 Contractor        🔧  │
│                  Logout   │
└──────────────────────────┘
│ Projects list + create   │
│ button                   │
└──────────────────────────┘

TAP LOGOUT → CONFIRM ↓

AFTER:
┌──────────────────────────┐
│ Username: [           ]  │
│ Password: [           ]  │  <- Login screen
│ Role: ◯ Contractor       │    (immediately)
│       ◯ Architect        │
│       ◯ Builder          │
└──────────────────────────┘
```

---

## Role-Based Features

### Contractor Role (Full Access) ✅

```
┌─────────────────────────────────────┐
│ 👤 John Contractor       🔧 Logout   │
├─────────────────────────────────────┤
│ Construction Timechart              │
│ Manage project schedules & activities│
├─────────────────────────────────────┤
│ [Project 1]  ✕ delete button        │
│ [Project 2]  ✕ delete button        │
├─────────────────────────────────────┤
│                              [+]    │  <- CREATE BUTTON VISIBLE
│                        (Green FAB)   │
└─────────────────────────────────────┘
```

### Builder Role (View-Only) ❌

```
┌─────────────────────────────────────┐
│ 👤 Bob Builder           🔧 Logout   │
├─────────────────────────────────────┤
│ Construction Timechart              │
│ View project timecharts             │
├─────────────────────────────────────┤
│ [Project 1]  (no delete button)     │
│ [Project 2]  (no delete button)     │
├─────────────────────────────────────┤
│                                    │  <- NO CREATE BUTTON
│                          (FAB hidden) │
└─────────────────────────────────────┘
```

---

## Console Output Visual Reference

When you tap buttons, watch for these colored logs in the terminal:

```
Timeline of a successful Logout:

User taps Logout button:
  └─> 🔴 Logout button pressed
      └─> Confirmation dialog shows
      └─> User taps "Logout"
          └─> 🔴 Logout confirmed, calling logout()
              └─> 🟡 [Auth] logout() called
              └─> 🟡 [Auth] removed currentUser from AsyncStorage
              └─> 🟡 [Auth] set user to null
              └─> 🟡 [Auth] set isLoggedIn to false
                  └─> 🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false
                      └─> Login screen appears on device
```

Timeline of a successful Session Clear:

User taps Debug (🔧) button:
  └─> 🔵 Debug button (clear session) pressed
      └─> Confirmation dialog shows
      └─> User taps "Clear"
          └─> 🔵 Clear session confirmed
          └─> 🔵 Calling clearStoredSession()
          └─> 🟠 [Dev] clearStoredSession() called
          └─> 🟠 [Dev] ✅ Stored session cleared
          └─> 🟡 [Auth] logout() called
          └─> ... (same as logout above)
              └─> "Restart app" message shown
              └─> User restarts app
                  └─> Login screen now appears
```

---

## Keyboard Shortcuts (For Testing)

In the Expo Terminal while app is running:

| Key | Action |
|-----|--------|
| `r` | Reload the app |
| `c` | Clear cache and reload |
| `w` | Open web browser version |
| `a` | Open Android emulator |
| `i` | Open iOS simulator |
| `q` | Quit |

---

## Mobile Device Orientation

### Portrait (Default)
```
┌─────────────────┐
│ Header + Buttons│  <- Buttons visible
│─────────────────┤
│ Projects List   │
│ (scrollable)    │
└─────────────────┘
```

### Landscape
```
┌──────────────────────────────────┐
│ Header + Buttons              │
├──────────────────────────────────┤
│ Projects (wider layout)           │
└──────────────────────────────────┘
```

If buttons aren't visible, try rotating device.

---

## Things That Should NOT Happen

❌ **Bad:** App crashes when tapping buttons
- Solution: Check console for red error messages

❌ **Bad:** Buttons don't show confirmation dialog
- Solution: Buttons might be off-screen; scroll up

❌ **Bad:** Dialog shows but nothing happens when tapping "Logout" or "Clear"
- Solution: Try `npm start -- --reset-cache`

❌ **Bad:** Logout logs show (🟡) but UI doesn't change
- Solution: Reload app with 'r' in Expo terminal

❌ **Bad:** Still logged in after logout
- Solution: Check console for error messages in red
