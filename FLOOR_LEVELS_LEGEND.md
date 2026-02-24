# Floor Levels in Legend - Implementation

## Overview
Added dynamic floor level colors to the timechart legend. When new floor levels are added to a project, they automatically appear in the legend with their assigned color codes.

## Changes Made

### File: `components/UnifiedTimeChartEditor.tsx`

**Location**: Legend section (around line 980)

**What Changed**:
- Extended the legend to dynamically display all floor levels from the project
- Added a map function that iterates through `timechart.floorLevels`
- Each floor level displays:
  - A colored box matching the floor level's color
  - The floor level name

**New Code**:
```tsx
{/* Floor Level Colors */}
{timechart.floorLevels && timechart.floorLevels.length > 0 && (
  <>
    {timechart.floorLevels.map((floorLevel) => (
      <View key={`legend-floor-${floorLevel.id}`} style={styles.legendItem}>
        <View style={[styles.legendBox, { backgroundColor: floorLevel.color }]} />
        <Text style={styles.legendText}>{floorLevel.name}</Text>
      </View>
    ))}
  </>
)}
```

## How It Works

1. **Floor Level Creation**:
   - When a user adds a new floor level through the UI
   - `handleAddFloorLevel()` in app/editor.tsx is called
   - The floor level is added to `timechart.floorLevels`

2. **Legend Display**:
   - The legend automatically checks for floor levels: `timechart.floorLevels`
   - For each floor level, it creates a legend entry
   - The color box uses the floor level's `color` property
   - The text displays the floor level's `name` property

3. **Auto-Update**:
   - When `setTimechart()` is called with new floor levels
   - The component re-renders
   - The legend automatically shows the new floor levels

## Legend Structure

The legend now displays in this order:
1. Non-Working Day (light red #FFE0E0)
2. Weekend (light gray #F0F0F0)
3. All floor levels (with their assigned colors) - dynamically added

## Example

If a project has these floor levels:
- Ground Floor: #FF6B6B (red)
- First Floor: #4ECDC4 (teal)
- Second Floor: #FFE66D (yellow)

The legend will display:
```
[Light Red] Non-Working Day
[Light Gray] Weekend
[Red] Ground Floor
[Teal] First Floor
[Yellow] Second Floor
```

## Technical Details

- **Type**: Floor levels are defined by `FloorLevel` interface in types/index.ts
  ```typescript
  interface FloorLevel {
    id: string;
    name: string;
    levelNumber: number;
    color: string;
  }
  ```

- **Storage**: Floor levels are stored in `TimeChartData.floorLevels` array

- **Rendering**: Uses React's `map()` function with unique keys for each floor level

- **Styling**: Reuses existing `legendItem` and `legendBox` styles

## Testing

To verify the feature works:

1. **Create a new project**
2. **Add multiple floor levels** with different colors
3. **View the timechart** - floor level colors should appear in the legend
4. **Add more floor levels** - legend updates automatically
5. **Update floor level colors** - legend updates to reflect new colors
6. **Delete floor levels** - legend removes corresponding entries

## Notes

- Floor levels appear in the legend in the order they were added
- The legend is dynamically rendered, so it always stays in sync with the project's floor levels
- Empty projects (with no floor levels) won't show any floor level entries in the legend, only the standard Non-Working Day and Weekend entries
