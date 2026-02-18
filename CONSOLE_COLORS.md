# Console Log Color Reference

## Quick Reference Card

Print this out and keep it handy while debugging!

```
┌─────────────────────────────────────────┐
│     CONSOLE LOG COLOR REFERENCE         │
├─────────────────────────────────────────┤
│                                         │
│  🔴 RED     = Logout Button Pressed    │
│  🟡 YELLOW  = Authentication Updates   │
│  🟣 PURPLE  = Layout/Navigation        │
│  🔵 BLUE    = Debug Button Pressed     │
│  🟠 ORANGE  = Session Operations       │
│                                         │
└─────────────────────────────────────────┘
```

---

## What Each Color Means

### 🔴 RED Logs - Logout Button Events
**File:** `app/index.tsx`

These logs appear when the logout button is tapped:
- `🔴 Logout button pressed` - User tapped the logout button
- `🔴 Logout confirmed, calling logout()` - User confirmed in dialog
- `🔴 Logout completed, isLoggedIn should update` - After logout completes

**What it means:**
- User is actively interacting with logout
- If you see these logs, the button IS responding
- Check the 🟡 logs next to see if auth updated

---

### 🟡 YELLOW Logs - Auth System Updates  
**File:** `hooks/useAuth.tsx`

These logs appear when authentication state changes:
- `🟡 [Auth] logout() called` - Logout function started
- `🟡 [Auth] removed currentUser from AsyncStorage` - Session cleared from storage
- `🟡 [Auth] set user to null` - User object cleared
- `🟡 [Auth] set isLoggedIn to false` - Login state updated to false

**What it means:**
- The authentication system is working
- Session is being removed properly
- If you see all of these, auth is functioning correctly

**Related logs from other operations:**
- `🟡 [Auth] login() called` - During login
- `🟡 [Auth] Logout error: ...` - Something went wrong

---

### 🟣 PURPLE Logs - Layout & Navigation
**File:** `app/_layout.tsx`

These logs appear when the main layout component renders:
- `🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false isLoading: true` - App starting, checking auth
- `🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false isLoading: false` - Auth check done, showing login
- `🟣 [Layout] RootLayoutNav rendered - isLoggedIn: true isLoading: false` - Logged in, showing app

**What it means:**
- This shows the final state that the app is in
- `isLoading: true` means waiting for AsyncStorage
- `isLoggedIn: false` means login screen should show
- `isLoggedIn: true` means app screens should show
- If this doesn't change after 🟡 logs, there's a problem

**Expected sequences:**
```
App Start (No Stored Session):
  🟣 isLoggedIn: false, isLoading: true
  → 🟣 isLoggedIn: false, isLoading: false ✓ (Shows login)

App Start (Has Stored Session):
  🟣 isLoggedIn: false, isLoading: true
  → 🟣 isLoggedIn: true, isLoading: false ✓ (Shows app)

After Logout:
  🟣 isLoggedIn: true, isLoading: false
  → 🟣 isLoggedIn: false, isLoading: false ✓ (Shows login)
```

---

### 🔵 BLUE Logs - Debug Button Events
**File:** `app/index.tsx`

These logs appear when the debug button (🔧) is tapped:
- `🔵 Debug button (clear session) pressed` - User tapped the debug button
- `🔵 Clear session confirmed` - User confirmed in dialog
- `🔵 Calling clearStoredSession()` - About to clear the session

**What it means:**
- User is using the debug/session-clearing feature
- If you see these logs, the button IS responding
- Check the 🟠 logs next to see if session was cleared

---

### 🟠 ORANGE Logs - Session Clearing Operations
**File:** `hooks/useAuth.tsx`

These logs appear when the session is being cleared:
- `🟠 [Dev] clearStoredSession() called` - Session clear function started
- `🟠 [Dev] ✅ Stored session cleared. App will show login screen on next start.` - Session successfully cleared

**What it means:**
- The stored user session is being removed from device storage
- If you see this, the session clear was successful
- After app restart, login screen should appear

---

## Complete Event Timeline

### Logout Event Timeline

```
User Taps Logout Button:
│
├─> 🔴 Logout button pressed
│   └─> Confirmation dialog shows
│
User Confirms in Dialog:
│
├─> 🔴 Logout confirmed, calling logout()
│   │
│   ├─> 🟡 [Auth] logout() called
│   │   └─> Auth function executes
│   │
│   ├─> 🟡 [Auth] removed currentUser from AsyncStorage
│   │   └─> Session deleted from device storage
│   │
│   ├─> 🟡 [Auth] set user to null
│   │   └─> User object cleared
│   │
│   ├─> 🟡 [Auth] set isLoggedIn to false
│   │   └─> Auth state updated
│   │
│   ├─> 🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false
│   │   └─> Layout re-renders with new state
│   │
│   └─> 🔴 Logout completed, isLoggedIn should update
│       └─> Login screen appears on device
```

### Session Clear Event Timeline

```
User Taps Debug (🔧) Button:
│
├─> 🔵 Debug button (clear session) pressed
│   └─> Confirmation dialog shows
│
User Confirms in Dialog:
│
├─> 🔵 Clear session confirmed
│
├─> 🔵 Calling clearStoredSession()
│   │
│   ├─> 🟠 [Dev] clearStoredSession() called
│   │   └─> Session clear function starts
│   │
│   └─> 🟠 [Dev] ✅ Stored session cleared
│       └─> Session removed from storage
│
├─> 🟡 [Auth] logout() called
│   └─> (Same as logout timeline above)
│
├─> 🟡 [Auth] removed currentUser from AsyncStorage
│
├─> 🟡 [Auth] set user to null
│
├─> 🟡 [Auth] set isLoggedIn to false
│
├─> 🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false
│
└─> Success message shown: "Session cleared. Please restart the app..."
    └─> After restart, login screen appears
```

---

## Troubleshooting by Color

### I Don't See ANY Colored Logs

**Problem:** Button might not be responding
- Try: Tap again, make sure you're tapping the button center
- Try: Scroll up to see if buttons are visible
- Try: Press `r` in Expo terminal to reload
- Try: `npm start -- --reset-cache`

---

### I See 🔴 Logs But NOT 🟡 Logs

**Problem:** Button pressed, but auth didn't update
- This shouldn't happen in normal operation
- Try: Check for red error messages in console
- Try: Reload the app with `r`

---

### I See 🔴 + 🟡 Logs But NOT 🟣 Logs

**Problem:** Auth updated, but layout didn't re-render
- This is unusual but indicates a state management issue
- Try: Reload the app with `r`
- Try: `npm start -- --reset-cache`

---

### I See 🔴 + 🟡 + 🟣 Logs But UI Didn't Change

**Problem:** All systems updated but UI didn't reflect it
- Try: Reload the app with `r`
- This might be a React Native rendering issue
- The system is working (proven by all 3 colors), just a UI refresh issue

---

### I See 🔵 + 🟠 Logs But Still Logged In

**Problem:** Session cleared but app still shows logged-in view
- This is normal before app restart
- Solution: Close and restart the app completely
- After restart, login screen should appear

---

## Log Level Guide

### These are DEBUG logs (Development Only)
- Appear in the Expo terminal during development
- Show colored emoji prefixes (🔴 🟡 🟣 🔵 🟠)
- Help diagnose issues

### Not shown in Production
- These are development-only logs
- Won't appear in production builds
- Can be removed later

---

## Using Colors to Debug

### Quick Diagnosis

**No logs = Button not responding**
- Tap again or reload app

**Only 🔴 logs = Button responded, but auth failed**
- Check for red error text below colored logs
- Try reloading

**🔴 + 🟡 logs = Auth worked but layout didn't update**
- Unusual issue
- Try reloading

**🔴 + 🟡 + 🟣 logs = Everything worked**
- UI should have changed
- Try reloading if it didn't

---

## Copy-Paste Test Commands

### Reload the App
```
Press 'r' in the Expo terminal
```

### Clear Cache and Reload
```
npm start -- --reset-cache
Then press 'r'
```

### Look for All Logs of One Color

In the terminal, filter logs by color:
```bash
# See only logout-related logs (red)
npm start 2>&1 | grep "🔴"

# See only auth logs (yellow)
npm start 2>&1 | grep "🟡"

# See only layout logs (purple)
npm start 2>&1 | grep "🟣"

# See only debug logs (blue)
npm start 2>&1 | grep "🔵"

# See all colored logs
npm start 2>&1 | grep -E "🔴|🟡|🟣|🔵|🟠"
```

---

## Color Legend (For Documentation)

When reading logs in documentation or guides:

| Color | Code | Meaning | File |
|-------|------|---------|------|
| 🔴 | RED | Button events | index.tsx |
| 🟡 | YELLOW | Auth state | useAuth.tsx |
| 🟣 | PURPLE | Layout/Nav | _layout.tsx |
| 🔵 | BLUE | Debug events | index.tsx |
| 🟠 | ORANGE | Session ops | useAuth.tsx |

---

## Print This!

```
╔═══════════════════════════════════════╗
║   CONSOLE LOG COLOR QUICK REFERENCE   ║
╠═══════════════════════════════════════╣
║                                       ║
║  🔴 RED     - Button pressed         ║
║  🟡 YELLOW  - Auth changed           ║
║  🟣 PURPLE  - Layout updated         ║
║  🔵 BLUE    - Debug button           ║
║  🟠 ORANGE  - Session cleared        ║
║                                       ║
║  All 5? → Everything working! ✅     ║
║  Some missing? → Check guides        ║
║  None? → Button not responding       ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

## One More Thing

The colors might look slightly different depending on your terminal:
- Some terminals: 🔴 = bright red, 🟡 = bright yellow
- Some terminals: Different shades of the same colors
- Key is to look for the emoji prefix, not exact shade

All logs include the emoji, so look for:
- `🔴` = Red (logout)
- `🟡` = Yellow (auth)
- `🟣` = Purple (layout)
- `🔵` = Blue (debug)
- `🟠` = Orange (session)

That's what matters!
