# Quick Debug Instructions

## Step-by-Step to Debug the Duplicate Activity Issue

### 1. Open Browser DevTools
- Press F12 (or right-click → Inspect → Console tab)
- Make sure you're in the **Console** tab

### 2. Run the Linking Scenario
Follow these exact steps and watch the console:

```
1. Create Activity 1 (e.g., "Foundation") - Save it
2. Create Activity 2 (e.g., "Framing") - Save it
3. Click the 🔗 link button on Activity 2
4. Select Activity 1 as target
5. Select offset (e.g., 0 or +1)
6. Click "Done"
7. Check console
```

### 3. What to Look For in Console

Copy all logs that have these prefixes and **share them with me**:
```
═══════════════════════════════════════════════════════════════
🔗 [LINK-BUTTON]
═══════════════════════════════════════════════════════════════

🔗 [LINK-MODAL]

═══════════════════════════════════════════════════════════════
🟢 [LINK-HANDLER-START]
(entire LINK-HANDLER section)
═══════════════════════════════════════════════════════════════

🟡 [SUBMIT-ACTIVITY]
(if this appears after LINK-HANDLER, it's the problem!)
```

### 4. The Most Important Check

After you see `✅ [LINK-HANDLER-COMPLETE] Linking process finished successfully`:

- **GOOD**: No more logs appear → Linking completed correctly
- **BAD**: `🟡 [SUBMIT-ACTIVITY]` appears → Duplicate activity is being created!

If you see BAD:
1. Copy-paste the SUBMIT-ACTIVITY logs
2. Note the `confirmedLinkedCount` and `activityName`
3. Share these with me

### 5. Send Me These Logs

Please copy from the console:
1. The ENTIRE LINK-BUTTON section
2. The ENTIRE LINK-HANDLER section  
3. Any SUBMIT-ACTIVITY logs that appear
4. Take a screenshot of the console if possible

This will help me identify exactly where the bug is!

---

## Filter Tips to Make It Easier

In the console, you can type in the **Filter** field:

- Type `LINK-HANDLER` to see only linking logs
- Type `SUBMIT-ACTIVITY` to see only activity creation logs
- Type `-SUBMIT-ACTIVITY` to hide activity creation logs

This makes it easier to track just the linking process!
