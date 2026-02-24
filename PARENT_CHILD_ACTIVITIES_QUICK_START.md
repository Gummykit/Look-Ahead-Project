# Parent-Child Activity Feature - Quick Reference

## 🎯 What's New

### Feature: Parent-Child Activities
Create dependent activities where a child activity automatically starts the day after the parent activity ends. Both activities move together when the parent is dragged on the timeline.

---

## 📋 How to Use

### Creating a Parent-Child Activity

1. **Click "+ Activity" button** in the control panel
2. **Fill Parent Activity Details:**
   - Activity Name (e.g., "Excavation")
   - Description (optional)
   - Start Date and End Date
   - Assigned Contractor
   - Floor Level

3. **Enable Child Activity (Optional):**
   - Check the box: "☐ Add Child Activity (Optional)"
   - Enter **Child Activity Name** (e.g., "Inspection")
   - Enter **Child Activity Duration** in days (e.g., 3)
   
4. **Click "Done"**
   - Both activities created automatically
   - Child starts the day after parent ends

### Example Timeline:
```
Parent Activity:  [Excavation] Jan 1-10 (10 days)
Child Activity:   [↳ Inspection] Jan 11-13 (3 days)
                                  ↑ Auto-calculated
```

---

## 🎨 Visual Indicators

### Parent Activity
- Standard styling
- Normal background color
- All control buttons visible

### Child Activity
```
[↳ Child Name]  ← Arrow shows relationship
├─ Faded background (#FAFAFA)
├─ Italic font style
├─ Blue left border
└─ Slightly indented
```

---

## 🎮 Interaction Patterns

### Moving Activities
1. **Drag parent activity** on timeline
2. **Child automatically moves** by same number of days
3. **Temporal relationship maintained** (child always starts next day)

Example:
```
Before:
[Excavation] Jan 1-10
[↳ Inspect] Jan 11-13

Drag parent → Jan 5
                ↓
After:
[Excavation] Jan 5-14
[↳ Inspect] Jan 15-17
             (moved 4 days)
```

### Marking Activities
- ✓ Mark parent as complete (strikethrough)
- ✓ Mark child as complete (strikethrough)
- Both can be marked **independently**

### Deleting Activities
- Delete parent activity
- **All child activities deleted automatically**
- No orphaned activities

---

## 📊 Timeline Display Structure

```
Timeline Row Structure:

Parent Activity Row:
┌─────────────────────────────────────────────────────┐
│ Activity Name │ Contractor │ [✓] [Started] [✕] │ ████│
└─────────────────────────────────────────────────────┘

Child Activity Row (appears directly below):
┌─────────────────────────────────────────────────────┐
│ ↳ Child Name  │ Contractor │ [✓] [Started] [✕] │ ██ │
└─────────────────────────────────────────────────────┘
  └─ Blue border  └─ Faded      └─ Same buttons
```

---

## ✨ Key Features

✅ **Automatic Scheduling**
- Child starts day after parent ends
- No manual date entry needed
- Duration in days is easy to set

✅ **Coordinated Movement**
- Drag parent → child moves with it
- Same offset applied to both
- Relationship always maintained

✅ **Cascading Operations**
- Delete parent → children deleted
- Prevents orphaned activities
- Single action removes entire chain

✅ **Visual Clarity**
- Arrow prefix (↳) shows relationship
- Faded styling indicates dependency
- Blue border clearly marks child

✅ **Independent Status**
- Mark parent/child started independently
- Mark parent/child completed independently
- Status doesn't affect the other

---

## 🔄 Data Flow

### Activity Creation
```
User Input:
├─ Parent Name, Dates, Contractor, Floor Level
├─ Enable Child Activity Checkbox
├─ Child Name, Duration
      ↓
Application:
├─ Generate unique IDs
├─ Calculate child dates (parent_end_date + 1 day)
├─ Set relationships (parentActivityId, childActivityIds)
      ↓
Result:
├─ Parent activity stored
└─ Child activity stored (linked to parent)
```

### Activity Movement
```
User Drags Parent:
├─ Calculate offset (days moved)
├─ Update parent dates
      ↓
System Detects Children:
├─ Find all child activities
├─ Apply same offset to each child
      ↓
Result:
├─ Parent at new dates
└─ All children moved by same offset
```

### Activity Deletion
```
User Deletes Parent:
├─ Find parent activity
├─ Find all child activities
      ↓
System Deletes:
├─ Parent activity
└─ All child activities
      ↓
Result: Clean removal, no orphans
```

---

## 🎯 Use Cases

### Example 1: Construction Phases
```
Parent: Foundation Work (Jan 1-15)
Child: Inspection (2 days)
Result:
├─ Foundation: Jan 1-15
└─ Inspection: Jan 16-17 (auto)
```

### Example 2: Quality Control
```
Parent: Concrete Pour (3 days)
Child: Cure Time Check (5 days)
Result:
├─ Concrete Pour: Jan 1-3
└─ Cure Check: Jan 4-8 (auto)
```

### Example 3: Multi-Stage Work
```
Parent: Excavation (10 days)
Child: Site Clearing (3 days)
Result:
├─ Excavation: Jan 1-10
└─ Clearing: Jan 11-13 (auto)
```

---

## ⚙️ Technical Details

### Type Updates
```typescript
interface Activity {
  // ... existing fields ...
  parentActivityId?: string;     // If this is a child
  childActivityIds?: string[];   // If this is a parent
  childDuration?: number;        // Temp, used during creation
  childActivityName?: string;    // Temp, used during creation
}
```

### Constraints
- ✓ Child must start day after parent
- ✓ Child duration is in days
- ✓ One parent can have one child
- ✓ Child cannot have children
- ✓ Dates auto-calculated (cannot be manually changed)

---

## 🧪 Testing Checklist

- [ ] Create activity with child activity
- [ ] Verify child starts day after parent
- [ ] Check dates are correct
- [ ] Drag parent activity (child moves too)
- [ ] Delete parent (child deleted automatically)
- [ ] Mark parent as started/completed
- [ ] Mark child as started/completed
- [ ] Create multiple parent-child pairs
- [ ] Move different parents (verify independence)

---

## 📝 Notes

- Child activity **inherits contractor and floor level** from parent
- Child activity **cannot be created without parent**
- Child activity **cannot exist independently** 
- **Backward compatible**: Old activities without parent-child fields work as before
- Child activity **name can be different** from parent
- Both parent and child have **unique IDs** for tracking

---

## 🚀 Coming Soon

Potential future enhancements:
- Multiple children per parent
- Configurable gap between parent and child
- Multi-level nesting (grandchildren)
- Different contractor for child
- Template-based creation

---

## 📚 Documentation Files

- `PARENT_CHILD_ACTIVITIES.md` - Comprehensive feature documentation
- `PARENT_CHILD_ACTIVITIES_IMPLEMENTATION.md` - Technical implementation details
- This file - Quick reference guide
