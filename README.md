# Construction Timechart Mobile App

A modern React Native application for construction project managers and workers to organize and visualize project schedules, manage subcontractors, track construction activities across timelines, and **log daily work progress with photos**.

## 🎯 Key Features

### Timechart Management
- 📊 Excel-like grid layout with dates and activities
- 🎨 Floor level color coding
- 🏢 Subcontractor and contractor management
- 🎉 Holiday marking and weekend highlighting
- 🖱️ Drag-and-drop activity rescheduling

### Daily Activity Logging (NEW!) ✨
- 📝 Multi-line notes with character counter
- 📸 Camera photo capture support
- 🖼️ Photo gallery selection
- 🗂️ Image gallery with removal
- 💾 Automatic data persistence
- ✏️ Edit logs anytime

## 🚀 Quick Start

### Installation
```bash
npm install
npx expo start
```

### Using Daily Activity Logging
1. Create/open a project
2. Click any activity cell on the timechart
3. Add work notes and/or photos
4. Tap Save
5. See golden indicator dot on logged cells

## 📚 Documentation

### For Users
- **Quick Guide**: [`QUICK_START_DAILY_LOGGING.md`](./QUICK_START_DAILY_LOGGING.md)
- **Visual Reference**: [`VISUAL_GUIDE.md`](./VISUAL_GUIDE.md)
- **Feature Details**: [`DAILY_LOGGING_FEATURE.md`](./DAILY_LOGGING_FEATURE.md)

### For Developers
- **Integration Guide**: [`DAILY_LOGGING_INTEGRATION.md`](./DAILY_LOGGING_INTEGRATION.md)
- **Implementation Summary**: [`DAILY_LOGGING_COMPLETE.md`](./DAILY_LOGGING_COMPLETE.md)
- **Status Checklist**: [`IMPLEMENTATION_CHECKLIST.md`](./IMPLEMENTATION_CHECKLIST.md)

## 🏗️ Project Structure

```
construction-timechart/
├── app/
│   ├── index.tsx                    # Home screen
│   ├── create-project.tsx           # Project creation
│   └── editor.tsx                   # Project editor
├── components/
│   ├── UnifiedTimeChartEditor.tsx   # Main UI
│   ├── DailyActivityLogModal.tsx    # Daily logging (NEW)
│   └── TimeChartView.tsx            # Legacy
├── types/
│   └── index.ts                     # TypeScript definitions
└── utils/
    ├── storage.ts                   # Data persistence
    └── dateUtils.ts                 # Date utilities
```

## 🔧 Development

### Running the App
```bash
npm start          # Start Expo CLI
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run lint       # Check code quality
```

### Project Setup
```bash
npm install                # Install dependencies
npx expo prebuild         # Setup native build (if needed)
npx eas build             # Build for app stores
```

## 📱 Platform Support

- **iOS**: 12.0+
- **Android**: 5.0+ (API 21)
- **Web**: Supported via Expo Web

## 📊 Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Storage**: AsyncStorage
- **Images**: expo-image-picker
- **State Management**: React Hooks

## 💡 How Daily Activity Logging Works

```
User clicks activity cell
    ↓
Modal opens (DailyActivityLogModal)
    ↓
User adds notes & photos
    ↓
User taps Save
    ↓
Data saved to AsyncStorage
    ↓
Golden indicator dot appears on cell
    ↓
Data persists across app restarts
```

## ✅ Validation Rules

**Can Log On:**
- Working days (Mon-Sat)
- Non-holiday dates
- Within activity timeline
- With notes OR images

**Cannot Log On:**
- Sundays (weekends)
- Public holidays
- Outside activity dates
- Without content

## 🎨 Styling

- Working Days: #FFFFFF
- Weekends: #F0F0F0
- Holidays: #FFE0E0
- Log Indicators: #FFD700
- Primary Actions: #45B7D1

## 📦 Dependencies

```json
{
  "expo": "~54.0.33",
  "react-native": "0.81.5",
  "expo-image-picker": "^17.0.10",
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

## 🐛 Troubleshooting

### Modal Won't Open
- Verify it's a working day cell
- Check activity spans the date
- Restart the app

### Photos Not Saving
- Check device storage
- Grant camera/gallery permissions
- Restart the app

See [`QUICK_START_DAILY_LOGGING.md`](./QUICK_START_DAILY_LOGGING.md#troubleshooting) for more.

## 📄 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Community

- [GitHub Issues](https://github.com/expo/expo)
- [Discord Community](https://chat.expo.dev)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

---

**Version**: 1.0.0 | **Status**: Production Ready ✅ | **Last Updated**: Feb 2026

