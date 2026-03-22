# Parent Link Field Debug Guide

## The Problem

When you link Activity 2 to Activity 1:
- ✅ Activity 2's dates ARE updated (moved to day after Activity 1 ends)
- ❌ Activity 2's `parentActivityId` is NOT being set (remains `undefined`)
- ❌ So Activity 2 doesn't appear as a child of Activity 1 on the chart

## What Should Happen

```
Activity 1 (Target): 2026-02-10 to 2026-02-16
     ↓
     └─→ Activity 2 (Source) becomes child: 2026-02-17 to 2026-02-25
         parentActivityId = Activity 1's ID
```

## What's Actually Happening

```
Activity 1 (Target): 2026-02-10 to 2026-02-16
Activity 2: 2026-02-17 to 2026-02-25 (dates correct, but parentActivityId = undefined)
```

---

## Critical Log Points to Check

### 1. **Source Updates Being Sent** (Line ~1072)
```
🟢 [LINK-HANDLER] Prepared updates:
  sourceUpdates: {
    parentActivityId: "71ql6kqee",  ← THIS SHOULD BE PRESENT
    startDate: "...",
    endDate: "...",
    duration: 9
  }
```

**Check**: Does the log show `parentActivityId: "71ql6kqee"`?
- If YES → field is sent correctly
- If NO → problem is in the linking handler

---

### 2. **Update Handler Receives It** (NEW - Just Added)
```
🔵 [Update] activityToUpdate object: {
  parentActivityId: "71ql6kqee",  ← SHOULD BE HERE
  startDate: "...",
  endDate: "...",
  duration: 9
}
🔵 [Update] Does it have parentActivityId? true, "71ql6kqee"
```

**Check**: Do both logs show `parentActivityId` is present?
- If YES → field made it to the handler
- If NO → problem is in parameter passing

---

### 3. **Update Handler Merges It**
```
🟢 [Update] Activity map - parent updated: {
  id: "ahoqiz5ge",
  parentActivityId: "71ql6kqee",  ← SHOULD BE HERE NOW
  oldStart: "...",
  newStart: "..."
}
```

**Check**: Does the merged object have `parentActivityId`?
- If YES → merge worked, but field was lost later
- If NO → merge operation failed to include it

---

### 4. **Render Logs Show Linked Activity**
```
🟣 [Render] Found 1 linked activities:
  linkedActivities: [{
    id: "ahoqiz5ge",
    name: "Y",
    parentId: undefined  ← ❌ PROBLEM: Should be "71ql6kqee"
  }]

🔵 [Render] Full linked activity object: {
  id: "ahoqiz5ge",
  name: "Y",
  parentActivityId: undefined,  ← ❌ STILL MISSING
  allKeys: ["id", "name", "startDate", ...]  ← Check if parentActivityId is in this list
}
```

**Check**: Is `parentActivityId` in the `allKeys` list?
- If NO → field was never added to the activity object
- If YES but undefined → field exists but has no value

---

## Step-by-Step Debug Process

1. **Trigger the linking**:
   - Create Activity A (e.g., Feb 10-16)
   - Create Activity B (e.g., Feb 10-18)
   - Click link button on Activity B
   - Select Activity A as target
   - Click Done

2. **Search for this sequence in console**:
   ```
   🟢 [LINK-HANDLER] Prepared updates:  (confirms sourceUpdates sent)
   🔵 [Update] activityToUpdate object: (new - shows what handler received)
   🔵 [Update] Does it have parentActivityId? (new - confirms field present)
   🟢 [Update] Activity map - parent updated: (shows merged result)
   🔵 [Render] Full linked activity object: (new - shows final activity object)
   ```

3. **At each step, check**:
   - Is `parentActivityId` present?
   - Does it have the correct value (the target activity's ID)?
   - Where did it get lost (if missing)?

---

## Key Questions for Debugging

1. **Is parentActivityId sent correctly?**
   - Look for: `🟢 [LINK-HANDLER] Prepared updates:`
   - Check the `sourceUpdates` object

2. **Does the handler receive it?**
   - Look for: `🔵 [Update] activityToUpdate object:`
   - Check if field is present

3. **Does the merge operation include it?**
   - Look for: `🟢 [Update] Activity map - parent updated:`
   - Check if field appears in merged object

4. **Is it in the final rendered activity?**
   - Look for: `🔵 [Render] Full linked activity object:`
   - Check `allKeys` array and the `parentActivityId` value

---

## If parentActivityId is Missing at Any Point...

| Step | If Missing | Problem | Fix |
|------|-----------|---------|-----|
| After "Prepared updates" | sourceUpdates | Linking handler not sending field | Check handleLinkActivities() in UnifiedTimeChartEditor.tsx |
| After "activityToUpdate object" | Handler received | Parameter passing broken | Check how sourceUpdates is passed to onUpdateActivity |
| After "Activity map merged" | Update handler | Merge operation `{ ...a, ...activityToUpdate }` failed | Check if field name is correct |
| After "Render logs" | Final activity | Field lost during state update | Check setTimechart() in editor.tsx |

---

## Run This Exact Scenario

1. Open app with DevTools console visible
2. Create two simple activities (use default names like "A" and "B")
3. Click the 🔗 link button on activity B
4. Select activity A as target
5. Click Done in the modal
6. **Immediately** look for logs with these prefixes in order:
   - `🟢 [LINK-HANDLER] Prepared updates:` ← Is parentActivityId here?
   - `🔵 [Update] activityToUpdate object:` ← Is parentActivityId here?
   - `🔵 [Update] Does it have parentActivityId?` ← True or false?
   - `🟢 [Update] Activity map - parent updated:` ← Is parentActivityId here?
   - `🔵 [Render] Full linked activity object:` ← Is parentActivityId in allKeys?

Copy all logs with these prefixes and paste them in your next message.
