# Hierarchical Activity Linking Guide

## What is Hierarchical Linking?

Hierarchical linking allows you to create **chains or tree structures** of linked activities. An activity can be:
- A **parent** (has children)
- A **child** (has a parent)  
- **Both** (has a parent AND children)

This enables multi-level project structures like:

```
Project Phase (Parent)
  ├─→ Phase A (Child of Project, Parent to A1 & A2)
  │    ├─→ A1 - Excavation (Grandchild)
  │    └─→ A2 - Foundation (Grandchild)
  └─→ Phase B (Child of Project, Parent to B1 & B2)
       ├─→ B1 - Framing (Grandchild)
       └─→ B2 - Roofing (Grandchild)
```

## How to Use Hierarchical Linking

### Step 1: Create Your Activities
```
Activity A (Feb 10-16)   [Parent - no parent]
Activity B (Feb 10-18)   [Can be child or parent]
Activity C (Feb 10-20)   [Can be child or parent]
```

### Step 2: Create First Link
- Click 🔗 on **Activity B**
- Select **Activity A** as target
- Set offset +2
- Result: **B becomes child of A**, moved to Feb 18-26

### Step 3: Create Hierarchical Link
- Click 🔗 on **Activity C**
- Select **Activity B** as target (B is already a child!)
- Set offset +1
- Result: **C becomes child of B** (grandchild of A), moved to Feb 27-onwards

## Chart Display

The chart will now show:

```
Activity A (Feb 10-16)
  └─→ Activity B (Feb 18-26) [Indented, child of A]
       └─→ Activity C (Feb 27-...) [Further indented, child of B]
```

## Use Cases

### Construction Projects
```
Main Project
  ├─→ Site Prep
  │    ├─→ Excavation
  │    └─→ Soil Preparation
  └─→ Foundation
       ├─→ Layout & Marking
       ├─→ Digging
       └─→ Concrete Pouring
```

### Software Development
```
Project
  ├─→ Design Phase
  │    ├─→ UI/UX Design
  │    └─→ Architecture Design
  ├─→ Development Phase
  │    ├─→ Backend Development
  │    └─→ Frontend Development
  └─→ Testing Phase
       ├─→ Unit Testing
       └─→ Integration Testing
```

### Renovation Project
```
Renovation
  ├─→ Interior Work
  │    ├─→ Walls
  │    ├─→ Flooring
  │    └─→ Paint
  └─→ Exterior Work
       ├─→ Roof
       ├─→ Siding
       └─→ Landscaping
```

## Important Notes

### ✅ What's Allowed
- An activity with a parent can also have children
- Multiple levels of nesting (A → B → C → D...)
- Each child has different dates (calculated with offset from parent's end date)
- Different contractors/floor levels at each level

### ❌ What's NOT Allowed
- An activity cannot link to itself
- Circular references (A → B → A) are prevented by the system
- An activity can only have ONE parent (but can have multiple children)

## Dates and Offsets

When you create a hierarchical link:

```
Parent Activity:  Feb 10-16
  Offset +2 to Child A: Feb 18-22
    Offset +1 to Child B: Feb 23-25

Formula: Child Start = Parent End + Offset
```

Each level's dates are calculated based on ITS parent's end date, not the top-level parent.

## Managing Hierarchical Links

### Viewing the Hierarchy
- Parent activities appear without indent
- Child activities appear indented below parent
- Grandchildren appear further indented
- Visual hierarchy matches relationship hierarchy

### Editing Activities in Hierarchy
- Edit any activity's dates (automatically updates all descendant activities)
- Edit any activity's properties independently
- Move activities around (their descendants move with them if they're parents)

### Removing Activities
- Removing a parent activity also removes ALL its children
- Confirm the action before removal (warns about descendants)

## Troubleshooting

### "Can't select this activity as target"
- Make sure it's not the source activity itself
- The target activity must exist and be saved
- Try refreshing the page

### Activity didn't move as expected
- Check the offset value (should be a number)
- Check the parent activity's end date
- Verify the source activity wasn't already linked to something else

### Dates seem wrong
- Dates are calculated: Parent End + Offset = Child Start
- Verify the parent's dates are correct first
- Check the offset is the value you intended

## Best Practices

1. **Plan your hierarchy** - Map out your project structure before creating links
2. **Use meaningful names** - Make parent/child relationships clear in activity names
3. **Consistent offsets** - Use the same offset pattern for similar tasks
4. **Test small hierarchies first** - Create 2-3 levels, verify dates, then expand
5. **Document the structure** - Add descriptions explaining the hierarchy relationships

## Performance Considerations

- Hierarchies up to 5-10 levels deep work well
- Very deep hierarchies (20+ levels) may be harder to visualize
- Each child update recalculates dates in the handler
- No performance degradation with multiple independent hierarchies
