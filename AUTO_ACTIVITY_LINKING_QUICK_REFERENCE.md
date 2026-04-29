# 🔗 Auto Activity Linking - Quick Reference

## What's New?

When you drag and place a new activity immediately after another activity on the same floor, the app automatically asks if you'd like to link them together.

## How To Use It

### Step 1: Create an Activity
- Click **"+ Add Activity"** 
- Fill in the name, contractor, duration, floor level
- Click **✓ Add**

### Step 2: Drag the Activity
- Long-press on the activity row you just created
- Drag it across the calendar to a new position
- Position it to start on the day right after another activity ends

### Step 3: Release & Confirm Link
- Release the drag
- A prompt appears: **"Link Activities?"**
- Choose **"Yes, Link"** to create the dependency
- Choose **"No"** to keep them separate

### Step 4: See the Link
- Once linked, the child activity appears grouped under the parent
- When you drag the parent, the child automatically follows!

---

## When Does the Prompt Appear?

✅ **Prompt shows when:**
- You place an activity on the **same floor** as another activity
- The activity starts on **exactly the day after** another activity ends
- The activity **doesn't already have a parent** linked to it

❌ **Prompt does NOT show when:**
- Activities are on **different floors**
- There's a **gap in days** between activities
- The activity already has a **parent link**
- The activity is a **grouped activity**

---

## Examples

### Example 1: Adjacent Activities (Prompt Shows ✅)
```
May 1-5:   Excavation (Floor 1)
May 6-10:  Framing (Floor 1) ← Dragged here

PROMPT: "Link 'Framing' to 'Excavation'?"
```

### Example 2: Gap Between Activities (No Prompt)
```
May 1-5:   Excavation (Floor 1)
May 6:     [Gap - no activity]
May 7-12:  Framing (Floor 1) ← Dragged here

NO PROMPT - There's a 1-day gap
```

### Example 3: Different Floors (No Prompt)
```
Floor 1 - May 1-5:   Excavation
Floor 2 - May 6-10:  Framing ← Dragged here

NO PROMPT - Different floors
```

---

## What Happens After Linking?

### Visual Changes
- Child activity appears nested under parent in the timechart
- Shows activity count if multiple linked: "(3)"

### Behavior Changes
- **Move Parent** → Child moves automatically with same offset
- **Delete Parent** → Child activity may be affected (depends on settings)
- **Edit Parent Dates** → Child dates don't change (only parent-initiated moves sync)

### Unlinking
- Open the child activity
- Click the link icon or edit button
- Choose "Unlink from parent"
- Activity becomes independent

---

## Console Logs (For Developers)

```
🔗 [Auto-Link] Detected activity positioned right after another activity
{
  draggedActivityId: "act-123",
  draggedActivityName: "Framing",
  potentialParentId: "act-456",
  potentialParentName: "Excavation",
  draggedActivityFloor: "floor-1"
}

🔗 [Auto-Link] User accepted linking, creating link now
OR
🔗 [Auto-Link] User declined linking
```

---

## Key Features

| Feature | Details |
|---------|---------|
| **Detection** | Automatic based on date adjacency |
| **Triggering** | Only on drag-release |
| **Confirmation** | User must confirm with "Yes, Link" button |
| **Floors** | Same floor only |
| **Dates** | Must be exactly adjacent (no gaps) |
| **Conflicts** | Won't link if already has parent |
| **Performance** | Minimal impact - only runs on drag release |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Prompt not showing | Check that both activities are on same floor and dates are adjacent |
| Can't drag activities | Make sure you have edit permissions (not view-only) |
| Activity doesn't move with parent | Refresh the app or check if link was actually created |
| Want to unlink | Open activity and click unlink button in edit modal |

---

## Permissions

- **Requires**: Edit Activity Permission
- **View-Only Users**: Cannot drag, so auto-link never appears

---

## Technical Summary

**Component**: `UnifiedTimeChartEditor.tsx`  
**Function**: `handleActivityPressOut()`  
**Trigger**: Activity drag release  
**Detection**: Date adjacency + same floor check  
**Action**: `onUpdateActivity()` with `parentActivityId` parameter  
**Status**: ✅ Production Ready (v1.0.0)

---

## Related Features

- **Manual Linking**: Use the link icon in activity rows
- **Activity Groups**: Linked activities appear grouped
- **Parent-Child Sync**: Parent movement updates child dates automatically

---

**Last Updated**: April 26, 2026  
**Version**: 1.0.0
