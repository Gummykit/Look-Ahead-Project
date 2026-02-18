# Quick Test Guide - Buttons & Session Clearing

## What We're Testing

✅ **Logout Button** - Red button in top-right header
✅ **Debug Button (🔧)** - Blue wrench button next to logout
✅ **Session Clearing** - Ability to clear stored user session

---

## Quick Start (30 seconds)

### 1. Start the Dev Server
```bash
cd "/Users/abheekranjandas/Documents/Look Ahead App/Project/construction-timechart"
npm start
```

### 2. Watch the Console
Keep the terminal visible - you'll see colored logs:
- 🔴 Red = Logout button events
- 🟡 Yellow = Auth system updates
- 🟣 Purple = Layout/navigation updates
- 🔵 Blue/Orange = Debug button events

### 3. Test Logout Button
1. Look at **top-right** of home screen
2. Tap the **red "Logout" button**
3. Confirm popup appears
4. Tap "Logout" in the popup
5. **Check console for:** `🔴 Logout button pressed`

### 4. Test Debug Button (🔧)
1. Look at **top-right** of home screen  
2. Tap the **blue 🔧 button**
3. Confirm popup appears
4. Tap "Clear" in the popup
5. **Check console for:** `🔵 clearStoredSession() called`

---

## Expected Console Output

### When Everything Works (✅ Success)

**After tapping Logout button and confirming:**
```
🔴 Logout button pressed
🔴 Logout confirmed, calling logout()
🟡 [Auth] logout() called
🟡 [Auth] removed currentUser from AsyncStorage
🟡 [Auth] set user to null
🟡 [Auth] set isLoggedIn to false
🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false isLoading: false
```

**After tapping Debug (🔧) button and confirming:**
```
🔵 Debug button (clear session) pressed
🔵 Clear session confirmed
🔵 Calling clearStoredSession()
🟠 [Dev] clearStoredSession() called
🟠 [Dev] ✅ Stored session cleared
🟡 [Auth] logout() called
🟡 [Auth] removed currentUser from AsyncStorage
🟡 [Auth] set user to null
🟡 [Auth] set isLoggedIn to false
🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false isLoading: false
```

---

## Troubleshooting (Choose One)

### 🔴 No logs appear when I tap buttons
```bash
# Option 1: Reload the app
# In the Expo terminal, press 'r'

# Option 2: Full reset
npm start -- --reset-cache
```

### 🟡 Logs appear but UI doesn't change
```bash
# Reload the app
# In the Expo terminal, press 'r'
```

### 🟣 Layout logs never appear
- Check if you see any error messages in red in the console
- Try `npm start -- --reset-cache`

### Buttons not visible
- Scroll up on the home screen
- Try rotating device to landscape
- Check if the header is under a SafeAreaView

---

## Test the Full Flow

### Step 1: Clear Session
- Tap 🔧 button → Tap "Clear" → Success message
- Restart the app

### Step 2: Should See Login Screen
- App should show login screen
- NOT the builder view

### Step 3: Login as Contractor
```
Username: contractor1
Password: contractor123
Role: Select "Contractor"
```
- Should see create button (+)
- Should see user showing "Contractor"

### Step 4: Test Logout
- Tap red "Logout" button
- Confirm logout
- Should return to login screen

### Step 5: Login as Builder
```
Username: builder1  
Password: builder123
Role: Select "Builder"
```
- Should NOT see create button (+)
- Should see user showing "Builder"

---

## Console Log Reference

| Color | Source | Meaning |
|-------|--------|---------|
| 🔴 Red | index.tsx | Logout button was tapped |
| 🟡 Yellow | useAuth.tsx | Auth state changed |
| 🟣 Purple | _layout.tsx | Navigation updated |
| 🔵 Blue | useAuth.tsx (Dev) | Debug function ran |
| 🟠 Orange | useAuth.tsx (Dev) | Session cleared |

---

## Questions?

- **Buttons don't respond:** See "Troubleshooting" above
- **App crashes:** Check for red error text in console
- **Login won't work:** Verify username/password (contractor1/contractor123)
- **Still stuck:** Share the **colored console logs** (🔴 🟡 🟣 🔵) for help

---

## Success Indicators ✅

- [ ] See 🔴 log when tapping logout
- [ ] See 🟡 logs for auth changes
- [ ] See 🟣 logs for layout updates
- [ ] See login screen after logout
- [ ] Can login with contractor credentials
- [ ] Create button appears for contractor
- [ ] Create button hidden for builder
