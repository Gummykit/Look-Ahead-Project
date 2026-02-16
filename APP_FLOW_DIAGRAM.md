# 📱 App Flow Diagram - Login First

## Visual User Journey

### New User / Logged Out

```
┌─────────────────────────────────────┐
│  Open App                           │
│  (App checks auth in background)    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Show Loading Spinner               │
│  (Checking AsyncStorage...)         │
└────────────┬────────────────────────┘
             │
             ▼ (Auth check complete)
┌─────────────────────────────────────┐
│  📱 LOGIN SCREEN (Homepage)         │
│                                     │
│  [Username: contractor1]            │
│  [Password: contractor123]          │
│                                     │
│  Role Selection:                    │
│  ◉ Contractor  ○ Architect  ○ Builder
│                                     │
│  [ Log In ] [ Sign Up ]             │
└────────────┬────────────────────────┘
             │ User clicks "Log In"
             ▼
┌─────────────────────────────────────┐
│  Authenticate...                    │
└────────────┬────────────────────────┘
             │
             ▼ (Auth successful)
┌─────────────────────────────────────┐
│  🏠 PROJECTS LIST (Main Screen)     │
│                                     │
│  👤 John Contractor                 │
│  Role: Contractor    [Logout]       │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Project Name: Building A        ││
│  │ Company: ABC Corp               ││
│  │ Location: City Center           ││
│  │ Duration: Jan-Dec 2024          ││
│  │ [Edit] [Delete]                 ││
│  └─────────────────────────────────┘│
│                                     │
│  [+ Create New Project]             │
└────────────┬────────────────────────┘
             │ Click project or "+ Create"
             ▼
┌─────────────────────────────────────┐
│  ✏️ EDITOR or CREATE PROJECT        │
└─────────────────────────────────────┘
```

---

## Returning User (Session Persisted)

```
┌─────────────────────────────────────┐
│  Open App                           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Show Loading Spinner               │
│  (Checking AsyncStorage...)         │
│  Found: contractor1 session         │
└────────────┬────────────────────────┘
             │
             ▼ (Session restored, isLoggedIn = true)
┌─────────────────────────────────────┐
│  🏠 PROJECTS LIST (Direct)          │
│                                     │
│  No login needed!                   │
│  User goes straight to projects.    │
└─────────────────────────────────────┘
```

---

## Logout Flow

```
┌─────────────────────────────────────┐
│  On Projects Screen                 │
│                                     │
│  [Logout] button clicked            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Confirm Dialog                     │
│  "Are you sure?"                    │
│  [Cancel] [Logout]                  │
└────────────┬────────────────────────┘
             │ User clicks "Logout"
             ▼
┌─────────────────────────────────────┐
│  Clear AsyncStorage                 │
│  Set isLoggedIn = false             │
└────────────┬────────────────────────┘
             │
             ▼ (Layout re-renders)
┌─────────────────────────────────────┐
│  📱 LOGIN SCREEN (Back to Homepage) │
│                                     │
│  Ready for new login                │
└─────────────────────────────────────┘
```

---

## State-Driven Navigation

### The Magic: isLoggedIn State

```
isLoggedIn = false          isLoggedIn = true
    ↓                           ↓
    │                           │
    ├─→ Layout detects change   ├─→ Layout detects change
    │                           │
    └─→ Show LOGIN screen       └─→ Show PROJECTS screen
```

**No manual `router.push()` or `router.replace()` needed!**

The layout automatically renders the correct screens based on the `isLoggedIn` state.

---

## Screen Hierarchy

### When Not Logged In
```
Stack Navigator
  └── login (visible)
      └── login form
          └── [Log In] [Sign Up] buttons
```

### When Logged In
```
Stack Navigator
  ├── index (visible first)
  │   └── Projects List
  │       ├── User info header
  │       ├── Projects list
  │       ├── [+ Create] button
  │       └── [Logout] button
  ├── create-project
  │   └── Project form
  ├── editor
  │   └── Timechart editor
  └── (tabs)
      └── Unused in this flow
```

---

## Navigation Timing

### Old Way (❌ Race Condition)
```
Auth state changes → Try to navigate immediately
                    Stack might not be ready
                    ERROR possible
```

### New Way (✅ State-Driven)
```
Auth state changes → Layout re-renders automatically
                    Stack shows correct screens
                    SUCCESS guaranteed
```

---

## Flow Summary

| Action | Before | Now |
|--------|--------|-----|
| **App starts** | Projects list or login | Login screen (homepage) |
| **After login** | Manual navigation | Automatic routing |
| **Logout** | Manual router.replace() | Automatic route change |
| **Session restore** | Projects or login | Projects (skips login) |
| **Navigation type** | Imperative | Declarative |

---

## Configuration

### Entry Point
```tsx
export const unstable_settings = {
  anchor: 'login',  // Login is the root
};
```

### Route Visibility
- **Not Logged In:** Only login screen visible
- **Logged In:** Projects, create, editor visible

### Automatic Transitions
- Login → Projects (via state change)
- Projects → Editor (via router.push)
- Any screen → Login (via logout)

---

## User Experience

### First Time
```
Clean, simple login experience
User sees login first
No confusion about where to start
```

### Returning Users
```
App remembers session
Loads directly to projects
Zero friction
```

### Logout
```
Immediate return to login
No loading screens
Seamless transition
```

---

## Technical Details

**How it works:**

1. User is not logged in (`isLoggedIn = false`)
2. Layout renders conditional: only `<Stack.Screen name="login" />`
3. Login screen displays

4. User enters credentials and clicks "Log In"
5. `login()` function called, `isLoggedIn` becomes `true`
6. Layout re-renders (detects state change)
7. Conditional now evaluates to true: render `<Stack.Screen name="index" />` first
8. Projects list appears

9. User clicks logout
10. `logout()` called, `isLoggedIn` becomes `false`
11. Layout re-renders
12. Back to login screen

**No manual navigation needed at any point!**

---

**Status:** ✅ Production Ready
**Date:** February 15, 2026
