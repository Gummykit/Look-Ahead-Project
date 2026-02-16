<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Construction Timechart Mobile App - Development Guidelines

## Project Overview
This is a React Native mobile application built with Expo for both iOS and Android platforms. The app helps construction project managers and workers organize and visualize project timelines, including public holidays, subcontractor assignments, and activity schedules.

## Technology Stack
- **Framework**: React Native with Expo
- **Routing**: Expo Router
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **Storage**: AsyncStorage for persistent data
- **Language**: TypeScript

## Project Structure
```
construction-timechart/
├── app/                    # Expo Router screens
│   ├── index.tsx          # Home screen
│   ├── create-project.tsx # Create new timechart
│   ├── editor.tsx         # Main editor screen
│   └── _layout.tsx        # Navigation layout
├── components/            # Reusable components
│   ├── HolidayTab.tsx    # Holiday management
│   ├── SubcontractorTab.tsx  # Subcontractor management
│   ├── ActivityTab.tsx   # Activity management with modal
│   └── TimeChartView.tsx # Timechart visualization
├── screens/              # (Legacy, may be removed)
├── types/                # TypeScript type definitions
│   └── index.ts
├── utils/                # Utility functions
│   ├── dateUtils.ts      # Date calculations
│   └── storage.ts        # AsyncStorage operations
└── constants/            # App constants
```

## Key Features
1. **Public Holiday Management**: Users can add and manage public holidays on the project timeline
2. **Subcontractor Management**: Create and manage subcontractor lists with color coding
3. **Activity Scheduling**: Add activities with start/end dates, duration, and subcontractor assignment
4. **Timechart Visualization**: Visual Gantt-like chart showing activities, holidays, and weekends
5. **Data Persistence**: All data is saved to device storage and persists across app sessions

## Data Model

### TimeChartData
- `id`: Unique identifier
- `projectName`: Project name
- `projectDescription`: Optional project description
- `startDate`: Project start date
- `endDate`: Project end date
- `publicHolidays`: Array of PublicHoliday objects
- `subcontractors`: Array of Subcontractor objects
- `activities`: Array of Activity objects
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### PublicHoliday
- `id`: Unique identifier
- `date`: Holiday date
- `name`: Holiday name
- `color`: Display color

### Subcontractor
- `id`: Unique identifier
- `name`: Contractor name
- `color`: Display color
- `isActive`: Activity status

### Activity
- `id`: Unique identifier
- `name`: Activity name
- `startDate`: Start date
- `endDate`: End date
- `duration`: Duration in days
- `subcontractorId`: Reference to subcontractor
- `subcontractorName`: Subcontractor name
- `description`: Optional description
- `color`: Display color
- `sequenceOrder`: Order in timeline

## UI/UX Guidelines
- **Color Scheme**: Primary blue (#0066CC), with accent colors for activities
- **Card-based Layout**: Clean, modern card-based design for lists
- **Tabs**: 4-tab interface for different sections (Holidays, Contractors, Activities, Chart)
- **Modal Dialogs**: Bottom sheet modals for adding/editing data
- **Responsive**: Adapts to different screen sizes

## Important Implementation Details

### Date Handling
- All dates are stored as JavaScript Date objects
- When persisting to storage, convert to ISO string format
- When loading from storage, convert back to Date objects
- Use `dateUtils.ts` functions for date calculations

### Storage Operations
- Use AsyncStorage for persistent data storage
- All storage operations should include error handling
- Timestamp updates on save

### Activity Management
- Activities automatically get a sequence order number
- The activity modal opens from the ActivityTab
- Validate date ranges and subcontractor selection
- Remove activities if subcontractor is deleted

### Timechart Visualization
- DAY_WIDTH constant controls scaling
- Holidays shown in light red (#FFE0E0)
- Weekends shown in light gray (#F0F0F0)
- Activity bars use subcontractor color
- Horizontal scrolling for viewing full timeline

## Common Tasks

### Adding a New Feature
1. Define TypeScript types in `types/index.ts`
2. Create component in `components/` folder
3. Add utility functions if needed in `utils/`
4. Update storage operations if data structure changes
5. Add to appropriate screen/tab

### Modifying Data Structure
1. Update type definitions
2. Update storage serialization/deserialization in `utils/storage.ts`
3. Update all components using that data
4. Test persistence across app restarts

### Styling
- Use StyleSheet.create() for component styles
- Follow existing color scheme and spacing patterns
- Ensure responsive design for various screen sizes

## Testing Checklist
- [ ] Create project with valid dates
- [ ] Add holidays within project timeline
- [ ] Add subcontractors
- [ ] Create activities with different durations
- [ ] Verify data persists after app close/restart
- [ ] Test timechart visualization with scrolling
- [ ] Verify delete operations work correctly
- [ ] Test error handling for invalid inputs
- [ ] Test on both iOS and Android simulators

## Future Enhancements
- Export timechart to PDF
- Share timecharts between users
- Project templates
- Calendar integration
- Activity dependencies and critical path analysis
- Team collaboration features
- Real-time synchronization
