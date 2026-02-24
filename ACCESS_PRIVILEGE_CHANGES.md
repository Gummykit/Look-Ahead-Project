# Access Privilege Changes - Activity Status Management

## Overview
Implemented granular access control for marking activities as "Started" and "Complete". Contractors and Sub-contractors can now mark activity status, while Observers can only view the status without making changes.

## Changes Made

### 1. Type Definitions (`types/index.ts`)

**Added new permissions to `RolePermissions` interface:**
- `canMarkActivityStarted: boolean` - Permission to mark an activity as started
- `canMarkActivityComplete: boolean` - Permission to mark an activity as complete

### 2. Role Permissions (`utils/rolePermissions.ts`)

**Updated role permissions:**

| Role | Can Mark Started | Can Mark Complete | Can View Status |
|------|------------------|-------------------|-----------------|
| Contractor | ✅ Yes | ✅ Yes | ✅ Yes |
| Sub-contractor | ✅ Yes | ✅ Yes | ✅ Yes |
| Observer | ❌ No | ❌ No | ✅ Yes |

**Permission Details:**

```typescript
contractor: {
  // ... other permissions
  canMarkActivityStarted: true,
  canMarkActivityComplete: true,
}

'sub-contractor': {
  // ... other permissions
  canMarkActivityStarted: true,
  canMarkActivityComplete: true,
}

observer: {
  // ... other permissions
  canMarkActivityStarted: false,
  canMarkActivityComplete: false,
}
```

### 3. Component Updates (`components/UnifiedTimeChartEditor.tsx`)

**Updated permission checks for both parent and child activities:**

**Before (using generic `canEdit`):**
```typescript
if (user && !canPerformAction(user.role, 'canEdit')) {
  Alert.alert('Permission Denied', '...');
  return;
}
```

**After (using specific permissions):**
```typescript
// For marking complete
if (user && !canPerformAction(user.role, 'canMarkActivityComplete')) {
  Alert.alert('Permission Denied', 'You do not have permission to mark activities as complete.');
  return;
}

// For marking started
if (user && !canPerformAction(user.role, 'canMarkActivityStarted')) {
  Alert.alert('Permission Denied', 'You do not have permission to mark activities as started.');
  return;
}
```

**Updated locations:**
- Parent activity "Mark as started" button
- Parent activity "Mark as complete" button
- Child activity "Mark as started" button
- Child activity "Mark as complete" button

## User Experience

### For Contractors & Sub-contractors:
- ✅ Can view activity status (started/completed indicators)
- ✅ Can mark activities as started (green button)
- ✅ Can mark activities as complete (checkmark/strikethrough)
- ✅ Buttons are clickable and functional

### For Observers:
- ✅ Can view activity status (started/completed indicators are visible)
- ❌ Cannot click "Mark as started" button - shows permission denied alert
- ❌ Cannot click "Mark as complete" button - shows permission denied alert
- 💡 Status indicators are still visible for reference

## Alert Messages

When an observer tries to mark an activity as started:
```
Permission Denied
You do not have permission to mark activities as started.
```

When an observer tries to mark an activity as complete:
```
Permission Denied
You do not have permission to mark activities as complete.
```

## Database/Type Impact

The `RolePermissions` interface now includes:
```typescript
export interface RolePermissions {
  // ... existing fields
  canMarkActivityStarted: boolean;
  canMarkActivityComplete: boolean;
}
```

## Testing Scenarios

### Test 1: Contractor Access
1. Login as Contractor
2. Add/view an activity
3. Click "Mark as started" button → ✅ Should update
4. Click "Mark as complete" button → ✅ Should update

### Test 2: Sub-contractor Access
1. Login as Sub-contractor
2. Add/view an activity
3. Click "Mark as started" button → ✅ Should update
4. Click "Mark as complete" button → ✅ Should update

### Test 3: Observer Access (View Only)
1. Login as Observer
2. View an activity with status indicators visible
3. Click "Mark as started" button → ❌ Should show permission denied
4. Click "Mark as complete" button → ❌ Should show permission denied
5. Status indicators should still be visible

### Test 4: Parent & Child Activities
1. Create an activity with a child activity
2. Test permissions on both parent and child
3. Verify same permission checks apply to both

## Related Permissions

Other role-based permissions that remain unchanged:
- `canEdit` - Edit project settings, general edits
- `canAddActivity` - Add new activities
- `canEditActivity` - Edit activity details (dates, names, etc.)
- `canDeleteActivity` - Delete activities
- `canLogDailyActivity` - Log daily work notes (all roles including observers)

## Backward Compatibility

✅ **No breaking changes:**
- Existing code checking `canEdit` continues to work
- New permissions are additive, not replacing existing ones
- Observers who could previously log daily activity still can

## Compilation Status

✅ **All files compile without errors**

- types/index.ts - No errors
- utils/rolePermissions.ts - No errors
- components/UnifiedTimeChartEditor.tsx - No errors
