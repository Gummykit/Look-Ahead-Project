# White Screen Startup Fix - Activity Merging Feature

## Issue Identified

The activity merging feature implementation introduced a white screen on startup due to incorrect JSX array wrapping in the `renderActivityRows()` function.

## Root Cause

In `components/UnifiedTimeChartEditor.tsx`, the `renderActivityRows()` function was incorrectly structured:

```tsx
// INCORRECT - Had extra array wrapping
return groupedActivities.flatMap((group) => {
  return [
    (
      <View>...</View>
    ),  // ← Extra comma and array
  ];
});
```

This caused React to receive malformed JSX elements, resulting in a blank white screen on startup.

## Solution Applied

### 1. Changed `flatMap` to `map`
- Removed unnecessary `flatMap` which was designed for flattening nested arrays
- Used standard `map` since we're returning single JSX elements

### 2. Removed Array Wrapping
- Removed the outer `[...]` array wrapper around the JSX View
- Removed the trailing comma and semicolon

### Corrected Code

```tsx
// CORRECT
return groupedActivities.map((group) => {
  // ... code ...
  return (
    <View key={`activity-group-${group.groupKey}`}>
      {/* Parent Activity Row */}
      <View style={styles.activityRowContainer}>
        {/* ... content ... */}
      </View>

      {/* Child Activity Rows */}
      {childActivities.map((childActivity) => {
        return (
          <View key={`activity-${childActivity.id}`}>
            {/* ... child content ... */}
          </View>
        );
      })}
    </View>
  );
});
```

## Files Modified

- `components/UnifiedTimeChartEditor.tsx` (lines 755-943)
  - Changed `flatMap` to `map`
  - Removed array wrapping `[(...),]` → `(...)`

## Verification

✅ **TypeScript Compilation**: No errors  
✅ **Metro Bundler**: Starts successfully  
✅ **App Structure**: Valid JSX syntax  

## Testing

The app should now:
1. Load without white screen
2. Display timechart correctly
3. Show grouped activities with subdivisions
4. All previous features work as expected

## Technical Detail

The issue was a common React mistake where:
- `flatMap` expects array returns: `[[...], [...]]` → `[..., ...]`
- But we were returning: `[[...],]` which created `[<View>, <Array with View>]`
- This resulted in invalid JSX and a blank render

By using `map` and removing the array wrapper, we now return:
- `[<View>, <View>, <View>]` ✓ (correct)

Instead of:
- `[<View>, [<View>], [<View>]]` ✗ (incorrect)
