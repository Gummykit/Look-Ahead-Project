# Debug Guide: Builder Role Issue

## Problem Summary

After server restart, the app is:
1. **Defaulting to the builder role** - Not showing the login screen
2. **Not allowing project creation** - "Add project" button is missing

## Root Cause

The app is **working correctly**. Here's what's happening:

### Why You See the Builder Role
- When you logged in as builder in previous testing, the app saved that session to **AsyncStorage** (device storage)
- On app restart, the auth system correctly restores that saved session
- You are automatically logged in as the builder from the previous session
- **This is intentional and correct behavior** - users should stay logged in between app restarts

### Why You Can't Add Projects
- The **Builder role has view-only access** (permission: `canEdit: false`)
- Builder users **cannot create, edit, or delete projects**
- Only **Contractor** and **Architect** roles have full edit access
- This is **working as designed** ✅

### Why It's Not Showing the Login Screen
- The login screen only appears **if there is NO stored session**
- Your stored builder session is being correctly restored
- To see the login screen, you need to **clear the stored session**

## Solution: Clear the Stored Session

### Method 1: Use the Debug Button (Easiest)

**Steps:**
1. In the app, look at the top-right of the header
2. Tap the **🔧 (wrench)** button next to the Logout button
3. Select **"Clear"** in the popup
4. Restart the app - you will now see the login screen

### Method 2: Use the Login Screen Button

**If you can navigate to the login screen:**
1. Find the **"🔄 Clear Stored Session (Dev)"** button at the bottom
2. Tap it to clear the stored session

### Method 3: Clear App Data (Nuclear Option)

If neither of the above works, clear the app's data:

**iOS (Simulator):**
```bash
xcrun simctl erase all
```

**Android (Emulator):**
```bash
adb shell pm clear com.example.yourapp
```

## Testing the Complete Flow

After clearing the session:

### 1. Login as Contractor (Full Access)
```
Username: contractor1
Password: contractor123
Role: Contractor
```
✅ You will see:
- User info showing "Contractor" role
- **Create Project button (+)** visible
- Ability to edit/delete projects

### 2. Login as Architect (Full Access)
```
Username: architect1
Password: architect123
Role: Architect
```
✅ You will see:
- User info showing "Architect" role
- **Create Project button (+)** visible
- Full edit/delete access

### 3. Login as Builder (View-Only)
```
Username: builder1
Password: builder123
Role: Builder
```
✅ You will see:
- User info showing "Builder" role
- **NO Create Project button** (by design - view-only)
- Cannot edit or delete projects
- Can only view and log daily activity

## How It Works Under the Hood

### Authentication Flow
1. **App starts** → `useAuth` hook checks AsyncStorage for stored user
2. **User found** → Auto-login, show projects list
3. **No user found** → Show login screen
4. **User logs in** → Session saved to AsyncStorage + state updated
5. **User logs out** → Session removed from AsyncStorage + state cleared

### Permission Matrix
```
Role          | Can Create | Can Edit | Can Delete | Can View
______________|____________|__________|____________|__________
Contractor    | ✅ Yes     | ✅ Yes   | ✅ Yes     | ✅ Yes
Architect     | ✅ Yes     | ✅ Yes   | ✅ Yes     | ✅ Yes
Builder       | ❌ No      | ❌ No    | ❌ No      | ✅ Yes
```

### Storage
- **AsyncStorage key:** `'currentUser'`
- **Stored data:** Logged-in user object (name, role, email, etc.)
- **Persistence:** Survives app restarts until explicitly cleared

## Verification Checklist

After clearing the session, verify:
- [ ] Login screen appears on app start
- [ ] Can login as contractor1/contractor123
- [ ] Create button (+) is visible as contractor
- [ ] Can create a new project
- [ ] Logout works correctly
- [ ] Login screen reappears after logout
- [ ] Can login as builder1/builder123
- [ ] Create button is **NOT** visible as builder
- [ ] Cannot edit/delete projects as builder

## Still Having Issues?

If the buttons aren't working or sessions aren't clearing:

### 1. Check the Console Logs

The app now includes detailed console logging. When you tap the buttons, look for these messages in the terminal running the dev server:

**When tapping the Debug (🔧) button:**
```
🔵 [Dev] clearStoredSession() called
🔵 [Dev] ✅ Stored session cleared. App will show login screen on next start.
🟡 [Auth] logout() called
🟡 [Auth] removed currentUser from AsyncStorage
🟡 [Auth] set user to null
🟡 [Auth] set isLoggedIn to false
🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false isLoading: false
```

**When tapping the Logout button:**
```
🔴 Logout button pressed
🔴 Logout confirmed, calling logout()
🟡 [Auth] logout() called
🟡 [Auth] removed currentUser from AsyncStorage
🟡 [Auth] set user to null
🟡 [Auth] set isLoggedIn to false
🔴 Logout completed, isLoggedIn should update
🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false isLoading: false
```

**App startup (should see isLoading first, then false):**
```
🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false isLoading: true
🟣 [Layout] RootLayoutNav rendered - isLoggedIn: true isLoading: false  // if session exists
// or
🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false isLoading: false // if no session
```

### 2. If Console Shows the Logs

If you see the logs (meaning the buttons ARE responding) but the UI doesn't change:
- The logout is working, but the navigation isn't updating
- Try tapping the button again
- Check if the layout is rendering (you should see the 🟣 log message)

### 3. If Console Shows NO Logs

If you DON'T see any console logs when tapping the buttons:
- The buttons might not be responding to taps
- Try this checklist:
  - [ ] Tap the button multiple times (sometimes needs 2-3 taps)
  - [ ] Tap in the center of the button, not the edges
  - [ ] Check if other buttons on the screen work (try tapping a project to edit it)
  - [ ] Make sure your fingers aren't on another UI element

### 4. Force Reload the Metro Bundler

If nothing works, force reload the dev server:
```bash
npm start -- --reset-cache
```

Then in the Expo terminal, press:
- `r` - to reload the app
- `c` - to clear the cache and reload

### 5. Check React Native logs

Look at the terminal running `npm start`. You should see output like:
```
LOG  🟔 [Device started]
LOG  🟣 [Layout] RootLayoutNav rendered - isLoggedIn: true isLoading: false
LOG  🔴 Logout button pressed
```

## Manual Testing Steps

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Watch the console** for startup logs (🟣 [Layout] messages)

3. **Tap the Debug button (🔧):**
   - Look for 🔵 and 🟡 logs
   - Confirm the success message appears
   - Restart the app - you should see login screen

4. **Login as Contractor:**
   - Username: `contractor1`
   - Password: `contractor123`
   - Look for 🟡 [Auth] login logs
   - Confirm create button appears

5. **Tap Logout:**
   - Look for 🔴 logs
   - Confirm "Are you sure?" popup appears
   - Tap "Logout" - look for 🟡 and 🟣 logs
   - Confirm login screen appears

## Troubleshooting: Buttons Not Responding

If the logout or debug buttons don't respond to taps, follow these steps:

### Step 1: Verify the Console is Connected

First, make sure you can see console logs at all:

1. **Open the terminal running `npm start`**
2. **Tap any project in the projects list** (this should navigate to editor)
3. **Watch the console** for `router.push` logs

If you see navigation logs but NOT button logs, proceed to Step 2.
If you don't see ANY logs, skip to Step 4.

### Step 2: Check if Buttons Are Visible

The buttons should be in the top-right of the home screen header:
- **🔧 (wrench)** - Debug button (blue background)
- **Logout** - Red button

**Visual check:**
1. Look at the top of the home screen
2. You should see "👤 John Contractor" on the left
3. On the right, you should see two buttons: 🔧 and "Logout"

If you don't see the buttons:
- The buttons might be outside the safe area
- Scroll up to see them
- Try rotating your device (landscape might show them better)

### Step 3: Tap with Console Watching

1. **Open the console output** - watch the terminal where `npm start` is running
2. **Tap the Logout button** - the red button on the right
3. **Immediately check the console** for these logs (in order):
   ```
   🔴 Logout button pressed
   🔴 Logout confirmed, calling logout()
   ```

**If you see those logs:** The button IS working, proceed to Step 5
**If you DON'T see logs:** Proceed to Step 4

### Step 4: Force Reload the App

If buttons aren't responding:

**Option A: Reload via Expo**
1. In the terminal running `npm start`, press `r`
2. App should refresh
3. Try tapping the button again

**Option B: Full restart**
```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm start -- --reset-cache
```

**Option C: Clear everything**
```bash
npm start -- --reset-cache
# Then press 's' for simulator/device specific options
```

### Step 5: If You See Logout Logs in Console

If you see the 🔴 logs but the app doesn't show the login screen:

**Expected sequence after logout:**
```
🔴 Logout button pressed
🔴 Logout confirmed, calling logout()
🟡 [Auth] logout() called
🟡 [Auth] removed currentUser from AsyncStorage
🟡 [Auth] set user to null
🟡 [Auth] set isLoggedIn to false
🟣 [Layout] RootLayoutNav rendered - isLoggedIn: false isLoading: false
```

**If you see ALL of these logs but UI doesn't change:**
- The state IS changing (layout logs prove it)
- This might be a rendering issue
- Try pressing 'r' in the Expo terminal to reload
- If still stuck, restart with `npm start -- --reset-cache`

**If you only see SOME logs (missing 🟡 or 🟣):**
- There's an error in the auth or layout code
- Check terminal for error messages (red text)
- Share the error message for more specific help

### Step 6: Direct AsyncStorage Clearing (Nuclear Option)

If all else fails, clear AsyncStorage directly using a temporary debug script:

**Create a temporary file `test-clear.js`:**
```javascript
const AsyncStorage = require('@react-native-async-storage/async-storage');

async function clearAll() {
  try {
    await AsyncStorage.removeItem('currentUser');
    console.log('✅ Cleared currentUser');
    
    // List all keys to verify
    const keys = await AsyncStorage.getAllKeys();
    console.log('📋 Remaining AsyncStorage keys:', keys);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

clearAll();
```

Then run:
```bash
node -e "require('@react-native-async-storage/async-storage').removeItem('currentUser').then(() => console.log('Cleared'))"
```

### Complete Debugging Checklist

```
[ ] 1. Console shows logs when tapping buttons
[ ] 2. 🔴 logs appear when tapping Logout
[ ] 3. 🟡 [Auth] logs appear after button tap
[ ] 4. 🟣 [Layout] logs appear with isLoggedIn: false
[ ] 5. Login screen appears after successful logout
[ ] 6. Can login as contractor and see create button
[ ] 7. Can logout from contractor view
[ ] 8. Can login as builder and see NO create button
```

If any item fails, note the number and share the console logs for debugging.

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Buttons not visible | Scroll up or rotate device to landscape |
| Buttons don't respond to taps | Try `npm start -- --reset-cache` |
| Logs show but UI doesn't update | Press 'r' in Expo terminal |
| Still logged in after logout | AsyncStorage still has data; use Step 6 |
| Login screen won't appear | Clear app data completely: `xcrun simctl erase all` |

### Final Resort

If absolutely nothing works:

**iOS Simulator:**
```bash
# Completely erase the simulator
xcrun simctl erase all
# Restart the app
npm start
```

**Android Emulator:**
```bash
# Clear app data
adb shell pm clear com.yourcompany.app
# Or factory reset
adb emu avd snapshot delete default
```

## Questions or Issues?

If you reach this point and still have issues:

1. **Take a screenshot** of the console output (the colorful logs)
2. **Note the step** where it stops working
3. **Share the error message** (if any)

The debugging logs (🔴, 🟡, 🟣, 🔵) will show exactly where the problem is.
