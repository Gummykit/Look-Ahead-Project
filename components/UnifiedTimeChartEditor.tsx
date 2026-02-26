import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  PanResponder,
  Animated,
  GestureResponderEvent,
  Image,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TimeChartData, Activity, User } from '../types';
import { getDaysBetween, getSignedDaysBetween, isPublicHoliday, isNonWorkingDay } from '../utils/dateUtils';
import { canPerformAction } from '../utils/rolePermissions';

// ─── Cross-platform Date Picker Field ────────────────────────────────────────
interface DatePickerFieldProps {
  label: string;
  value: string; // YYYY-MM-DD string
  onChange: (dateString: string) => void;
  minDate?: Date;
  maxDate?: Date;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, value, onChange, minDate, maxDate }) => {
  const [showPicker, setShowPicker] = useState(false);

  // Parse current value to a Date for the native picker
  const parsedDate = value
    ? (() => { const [y, m, d] = value.split('-').map(Number); return new Date(y, m - 1, d); })()
    : new Date();

  if (Platform.OS === 'web') {
    // On web, use the browser's native date input
    return (
      <View>
        <Text style={datePickerStyles.label}>{label}</Text>
        <View style={datePickerStyles.webInputWrapper}>
          <Text style={datePickerStyles.calendarIcon}>📅</Text>
          <input
            type="date"
            value={value}
            min={minDate ? minDate.toISOString().split('T')[0] : undefined}
            max={maxDate ? maxDate.toISOString().split('T')[0] : undefined}
            onChange={(e) => onChange(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 13,
              color: '#333',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
        </View>
      </View>
    );
  }

  // iOS / Android: show a button that opens a DateTimePicker modal
  return (
    <View>
      <Text style={datePickerStyles.label}>{label}</Text>
      <TouchableOpacity style={datePickerStyles.nativeButton} onPress={() => setShowPicker(true)}>
        <Text style={datePickerStyles.calendarIcon}>📅</Text>
        <Text style={datePickerStyles.nativeButtonText}>{value || 'Select a date'}</Text>
      </TouchableOpacity>
      {showPicker && (
        <Modal transparent animationType="slide">
          <View style={datePickerStyles.modalOverlay}>
            <View style={datePickerStyles.pickerCard}>
              <DateTimePicker
                value={parsedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={minDate}
                maximumDate={maxDate}
                onChange={(_event, selectedDate) => {
                  if (Platform.OS === 'android') setShowPicker(false);
                  if (selectedDate) {
                    const y = selectedDate.getFullYear();
                    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const d = String(selectedDate.getDate()).padStart(2, '0');
                    onChange(`${y}-${m}-${d}`);
                  }
                }}
              />
              <TouchableOpacity style={datePickerStyles.doneButton} onPress={() => setShowPicker(false)}>
                <Text style={datePickerStyles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const datePickerStyles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  webInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  calendarIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  nativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  nativeButtonText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    paddingTop: 8,
    alignItems: 'center',
  },
  doneButton: {
    marginTop: 12,
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 10,
  },
  doneButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

const holidayTypeStyles = StyleSheet.create({
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#DDD',
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
  },
  colorSwatch: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  optionLabel: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: '#222',
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 14,
    color: '#CC2200',
    fontWeight: '700',
  },
});
// ─────────────────────────────────────────────────────────────────────────────

interface UnifiedTimeChartEditorProps {
  timechart: TimeChartData;
  user?: User | null; // Add user prop for permission checking
  onAddHoliday?: (holiday: any) => void; // Deprecated, use onAddNonWorkingDay
  onRemoveHoliday?: (id: string) => void; // Deprecated, use onRemoveNonWorkingDay
  onAddNonWorkingDay?: (day: any) => void;
  onRemoveNonWorkingDay?: (id: string) => void;
  onAddSubcontractor: (name: string) => void;
  onRemoveSubcontractor: (id: string) => void;
  onAddActivity: (activity: any) => void;
  onRemoveActivity: (id: string) => void;
  onUpdateActivity: (id: string, activity: any) => void;
  onAddFloorLevel: (floorLevel: any) => void;
  onUpdateFloorLevel: (id: string, floorLevel: any) => void;
  onRemoveFloorLevel: (id: string) => void;
  onAddOrUpdateDailyLog: (activityId: string, date: Date, notes: string, imageUris: string[]) => void;
  onRemoveDailyLog: (logId: string) => void;
}

export const UnifiedTimeChartEditor: React.FC<UnifiedTimeChartEditorProps> = ({
  timechart,
  user,
  onAddHoliday,
  onRemoveHoliday,
  onAddNonWorkingDay,
  onRemoveNonWorkingDay,
  onAddSubcontractor,
  onRemoveSubcontractor,
  onAddActivity,
  onRemoveActivity,
  onUpdateActivity,
  onAddFloorLevel,
  onUpdateFloorLevel,
  onRemoveFloorLevel,
  onAddOrUpdateDailyLog,
  onRemoveDailyLog,
}) => {
  const { width } = Dimensions.get('window');
  const DAY_WIDTH = 50;
  const ACTIVITY_LABEL_WIDTH = 150;
  const CONTRACTOR_LABEL_WIDTH = 130;

  const totalDays = getDaysBetween(timechart.startDate, timechart.endDate) + 1;
  const chartWidth = totalDays * DAY_WIDTH + ACTIVITY_LABEL_WIDTH + CONTRACTOR_LABEL_WIDTH;

  const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showAddContractorModal, setShowAddContractorModal] = useState(false);
  const [showManagePanelModal, setShowManagePanelModal] = useState(false);
  const [showFloorLevelModal, setShowFloorLevelModal] = useState(false);

  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayType, setHolidayType] = useState<'public-holiday' | 'non-working-day'>('non-working-day');

  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [startActivityDate, setStartActivityDate] = useState(
    new Date(timechart.startDate).toISOString().split('T')[0]
  );
  const [endActivityDate, setEndActivityDate] = useState(
    new Date(timechart.startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<string | null>(
    timechart.subcontractors.length > 0 ? timechart.subcontractors[0].id : null
  );
  const [selectedFloorLevel, setSelectedFloorLevel] = useState<string | null>(
    (timechart.floorLevels && timechart.floorLevels.length > 0) ? timechart.floorLevels[0].id : null
  );

  const [contractorName, setContractorName] = useState('');
  
  // Child activity state
  const [hasChildActivity, setHasChildActivity] = useState(false);
  const [childActivityName, setChildActivityName] = useState('');
  const [childActivityDuration, setChildActivityDuration] = useState('1');
  
  // Floor level management state
  const [floorLevelName, setFloorLevelName] = useState('');
  const [floorLevelColor, setFloorLevelColor] = useState('#FF6B6B');
  const [editingFloorLevelId, setEditingFloorLevelId] = useState<string | null>(null);
  
  // Drag and drop state
  const [draggingActivityId, setDraggingActivityId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragActivity, setDragActivity] = useState<Activity | null>(null);
  
  // Daily activity logging state
  const [showDailyLogModal, setShowDailyLogModal] = useState(false);
  const [selectedActivityForLog, setSelectedActivityForLog] = useState<Activity | null>(null);
  const [selectedLogDate, setSelectedLogDate] = useState<Date | null>(null);
  const [dailyLogNotes, setDailyLogNotes] = useState('');
  const [dailyLogImages, setDailyLogImages] = useState<string[]>([]);
  
  // Double-tap detection state
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastTappedCell, setLastTappedCell] = useState<string | null>(null);
  
  const FLOOR_LEVEL_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#52BE80',
    '#EC7063', '#AF7AC5', '#5DADE2', '#F5B041', '#52BE80'
  ];

  const handleAddHoliday = () => {
    // Check if user has permission to add non-working days
    if (user && !canPerformAction(user.role, 'canAddHoliday')) {
      Alert.alert('Permission Denied', 'You do not have permission to add non-working days.');
      return;
    }

    if (!holidayDate.trim()) {
      Alert.alert('Error', 'Please enter non-working day date');
      return;
    }

    // Parse the date string carefully to avoid timezone issues
    // Format expected: YYYY-MM-DD
    const [year, month, day] = holidayDate.split('-').map(Number);
    const holidayDateObj = new Date(year, month - 1, day);
    holidayDateObj.setHours(0, 0, 0, 0);
    
    const startDateCopy = new Date(timechart.startDate);
    startDateCopy.setHours(0, 0, 0, 0);
    
    const endDateCopy = new Date(timechart.endDate);
    endDateCopy.setHours(0, 0, 0, 0);
    
    if (holidayDateObj.getTime() < startDateCopy.getTime() || holidayDateObj.getTime() > endDateCopy.getTime()) {
      Alert.alert('Error', 'Non-working day date must be within project timeline');
      return;
    }

    const addFunction = onAddNonWorkingDay || onAddHoliday;
    if (addFunction) {
      const color = holidayType === 'public-holiday' ? '#FFB3B3' : '#FFE0E0';
      const name = holidayType === 'public-holiday' ? 'Public Holiday' : 'Non-Working Day';
      addFunction({
        date: holidayDateObj,
        name,
        color,
      });
    }

    // setHolidayName(''); // Name field is commented out
    setHolidayDate('');
    setHolidayType('non-working-day');
    setShowAddHolidayModal(false);
  };

  const handleAddActivity = () => {
    // Check if user has permission to add activities
    if (user && !canPerformAction(user.role, 'canAddActivity')) {
      Alert.alert('Permission Denied', 'You do not have permission to add activities.');
      return;
    }

    if (!activityName.trim()) {
      Alert.alert('Error', 'Please enter activity name');
      return;
    }

    if (!selectedSubcontractor) {
      Alert.alert('Error', 'Please select a subcontractor');
      return;
    }

    if (!selectedFloorLevel) {
      Alert.alert('Error', 'Please select a floor level');
      return;
    }

    // Parse dates carefully to avoid timezone issues
    const [startYear, startMonth, startDay] = startActivityDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    start.setHours(0, 0, 0, 0);

    const [endYear, endMonth, endDay] = endActivityDate.split('-').map(Number);
    const end = new Date(endYear, endMonth - 1, endDay);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
      Alert.alert('Error', 'End date must be on or after start date');
      return;
    }

    const subcontractor = timechart.subcontractors.find(s => s.id === selectedSubcontractor);
    const floorLevel = (timechart.floorLevels || []).find(f => f.id === selectedFloorLevel);
    
    if (!subcontractor) {
      Alert.alert('Error', 'Invalid subcontractor');
      return;
    }

    if (!floorLevel) {
      Alert.alert('Error', 'Invalid floor level');
      return;
    }

    onAddActivity({
      name: activityName.trim(),
      description: activityDescription.trim() || undefined,
      startDate: start,
      endDate: end,
      duration: getDaysBetween(start, end),
      subcontractorId: selectedSubcontractor,
      subcontractorName: subcontractor.name,
      floorLevelId: selectedFloorLevel,
      floorLevelName: floorLevel.name,
      floorLevelColor: floorLevel.color,
      childActivityIds: [],
      childDuration: hasChildActivity ? parseInt(childActivityDuration) || 1 : undefined,
      childActivityName: hasChildActivity ? childActivityName.trim() : undefined,
    });

    setActivityName('');
    setActivityDescription('');
    setStartActivityDate(new Date(timechart.startDate).toISOString().split('T')[0]);
    setEndActivityDate(
      new Date(timechart.startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    setSelectedSubcontractor(timechart.subcontractors.length > 0 ? timechart.subcontractors[0].id : null);
    setSelectedFloorLevel((timechart.floorLevels && timechart.floorLevels.length > 0) ? timechart.floorLevels[0].id : null);
    setHasChildActivity(false);
    setChildActivityName('');
    setChildActivityDuration('1');
    setShowAddActivityModal(false);
  };

  const handleAddContractor = () => {
    if (!contractorName.trim()) {
      Alert.alert('Error', 'Please enter contractor name');
      return;
    }
    onAddSubcontractor(contractorName.trim());
    setContractorName('');
    setShowAddContractorModal(false);
  };

  const handleAddOrUpdateFloorLevel = () => {
    if (!floorLevelName.trim()) {
      Alert.alert('Error', 'Please enter floor level name');
      return;
    }

    if (editingFloorLevelId) {
      // Update existing floor level
      onUpdateFloorLevel(editingFloorLevelId, {
        name: floorLevelName.trim(),
        color: floorLevelColor,
      });
      setEditingFloorLevelId(null);
    } else {
      // Add new floor level
      onAddFloorLevel({
        name: floorLevelName.trim(),
        color: floorLevelColor,
        levelNumber: (timechart.floorLevels || []).length,
      });
    }

    setFloorLevelName('');
    setFloorLevelColor('#FF6B6B');
    setShowFloorLevelModal(false);
  };

  const handleEditFloorLevel = (floorLevel: any) => {
    setFloorLevelName(floorLevel.name);
    setFloorLevelColor(floorLevel.color);
    setEditingFloorLevelId(floorLevel.id);
    setShowFloorLevelModal(true);
  };

  const handleCancelEditFloorLevel = () => {
    setFloorLevelName('');
    setFloorLevelColor('#FF6B6B');
    setEditingFloorLevelId(null);
    setShowFloorLevelModal(false);
  };

  const handleActivityPressIn = (activity: Activity, event: GestureResponderEvent) => {
    // Check if user has permission to edit activities
    if (user && !canPerformAction(user.role, 'canEditActivity')) {
      console.log('🔴 [Permission] User does not have permission to edit activities');
      Alert.alert('Permission Denied', 'You do not have permission to edit timechart activities. Your role is view-only.');
      return;
    }

    setDraggingActivityId(activity.id);
    setDragStartX(event.nativeEvent.pageX);
    setDragActivity(activity);
  };

  const handleActivityPressMove = (event: GestureResponderEvent) => {
    if (!draggingActivityId || !dragActivity) return;

    const currentX = event.nativeEvent.pageX;
    const deltaX = currentX - dragStartX;
    
    // Calculate how many days the user dragged
    const daysDelta = Math.round(deltaX / DAY_WIDTH);

    if (daysDelta === 0) return; // No significant movement yet

    // Calculate new dates
    const newStartDate = new Date(dragActivity.startDate);
    newStartDate.setDate(newStartDate.getDate() + daysDelta);

    const newEndDate = new Date(dragActivity.endDate);
    newEndDate.setDate(newEndDate.getDate() + daysDelta);

    // Validate new dates are within project timeline
    if (newStartDate < timechart.startDate || newEndDate > timechart.endDate) {
      Alert.alert('Error', 'Activity cannot be moved outside the project timeline');
      return;
    }

    // Update the drag activity for visual feedback
    setDragActivity({
      ...dragActivity,
      startDate: newStartDate,
      endDate: newEndDate,
    });

    // Update the start position for next calculation
    setDragStartX(currentX);
  };

  const handleActivityPressOut = () => {
    if (!draggingActivityId || !dragActivity) {
      setDraggingActivityId(null);
      setDragActivity(null);
      return;
    }

    // Find the activity in the timechart to check if it has children
    const activity = timechart.activities.find(a => a.id === draggingActivityId);
    const childActivityIds = activity?.childActivityIds || [];
    
    // Calculate the offset (days moved) BEFORE updating parent
    // Use getSignedDaysBetween to handle both forward and backward movement correctly
    let offset = 0;
    if (activity && childActivityIds.length > 0) {
      offset = getSignedDaysBetween(activity.startDate, dragActivity.startDate);
      console.log('🔵 [Drag] Parent offset calculation:', {
        originalStartDate: activity.startDate,
        dragActivityStartDate: dragActivity.startDate,
        offset: offset,
      });
    }
    
    console.log('🔵 [Drag] Updating parent activity:', {
      id: draggingActivityId,
      newStartDate: dragActivity.startDate,
      newEndDate: dragActivity.endDate,
    });
    
    // IMPORTANT: For parent activities with children, we need to update ALL at once
    // to avoid stale state issues. We'll do this by calling handleUpdateActivityWithChildren
    if (childActivityIds.length > 0) {
      // This is a parent with children - update all together
      const childUpdatesData = childActivityIds.map((childId) => {
        const childActivity = timechart.activities.find(a => a.id === childId);
        if (childActivity) {
          const newChildStartDate = new Date(childActivity.startDate);
          newChildStartDate.setDate(newChildStartDate.getDate() + offset);
          const newChildEndDate = new Date(childActivity.endDate);
          newChildEndDate.setDate(newChildEndDate.getDate() + offset);
          
          return {
            childId: childId,
            updates: {
              startDate: newChildStartDate,
              endDate: newChildEndDate,
              duration: childActivity.duration,
            }
          };
        }
        return null;
      }).filter(Boolean) as any[];

      // Call a special update method that handles parent + children together
      onUpdateActivity(draggingActivityId, {
        startDate: dragActivity.startDate,
        endDate: dragActivity.endDate,
        duration: getDaysBetween(dragActivity.startDate, dragActivity.endDate),
        childUpdates: childUpdatesData, // Pass child updates as part of parent update
      });
    } else {
      // Regular activity without children - update normally
      onUpdateActivity(draggingActivityId, {
        startDate: dragActivity.startDate,
        endDate: dragActivity.endDate,
        duration: getDaysBetween(dragActivity.startDate, dragActivity.endDate),
      });
    }

    setDraggingActivityId(null);
    setDragActivity(null);
  };

  const handleOpenDailyLog = (activity: Activity, cellDate: Date) => {
    setSelectedActivityForLog(activity);
    setSelectedLogDate(cellDate);
    
    // Check if there's an existing log for this activity/date
    const existingLog = timechart.dailyActivityLogs?.find(
      log => log.activityId === activity.id && 
              new Date(log.date).toDateString() === cellDate.toDateString()
    );
    
    if (existingLog) {
      setDailyLogNotes(existingLog.notes);
      setDailyLogImages(existingLog.imageUris || []);
    } else {
      setDailyLogNotes('');
      setDailyLogImages([]);
    }
    
    setShowDailyLogModal(true);
  };

  const handleCellDoubleTab = (activity: Activity, currentDate: Date, cellKey: string) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // milliseconds

    if (lastTappedCell === cellKey && now - lastTapTime < DOUBLE_TAP_DELAY) {
      // Double-tap detected!
      handleOpenDailyLog(activity, currentDate);
      setLastTappedCell(null);
      setLastTapTime(0);
    } else {
      // First tap or tap on different cell
      setLastTappedCell(cellKey);
      setLastTapTime(now);
    }
  };

  const handleSaveDailyLog = () => {
    if (!selectedActivityForLog || !selectedLogDate) {
      Alert.alert('Error', 'Missing activity or date information');
      return;
    }

    if (!dailyLogNotes.trim()) {
      Alert.alert('Error', 'Please enter some notes for the daily log');
      return;
    }

    onAddOrUpdateDailyLog(
      selectedActivityForLog.id,
      selectedLogDate,
      dailyLogNotes.trim(),
      dailyLogImages
    );

    // Reset state
    setShowDailyLogModal(false);
    setSelectedActivityForLog(null);
    setSelectedLogDate(null);
    setDailyLogNotes('');
    setDailyLogImages([]);
    
    Alert.alert('Success', 'Daily log saved successfully');
  };

  const handleAddImage = () => {
    // For now, show a placeholder alert. In a real app, you'd use expo-image-picker
    Alert.alert(
      'Add Image',
      'Image picker functionality would open here to select construction photos',
      [{ text: 'OK' }]
    );
    // TODO: Integrate expo-image-picker when available
  };

  const handleRemoveImage = (index: number) => {
    setDailyLogImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleToggleActivityCompletion = (activityId: string) => {
    // Check if user has permission to edit activities
    if (user && !canPerformAction(user.role, 'canEdit')) {
      Alert.alert('Permission Denied', 'You do not have permission to mark activities as complete.');
      return;
    }

    const activity = timechart.activities.find(a => a.id === activityId);
    if (activity) {
      onUpdateActivity(activityId, {
        ...activity,
        isCompleted: !activity.isCompleted
      });
    }
  };

  const handleToggleActivityStarted = (activityId: string) => {
    // Check if user has permission to edit activities
    if (user && !canPerformAction(user.role, 'canEdit')) {
      Alert.alert('Permission Denied', 'You do not have permission to mark activities as started.');
      return;
    }

    const activity = timechart.activities.find(a => a.id === activityId);
    if (activity) {
      onUpdateActivity(activityId, {
        ...activity,
        isStarted: !activity.isStarted
      });
    }
  };

  // Group activities by name and contractor ID
  const groupActivitiesByNameAndContractor = () => {
    const groupedMap = new Map<string, Activity[]>();
    
    (timechart.activities || [])
      .filter(activity => !activity.parentActivityId) // Only parent activities
      .forEach(activity => {
        const groupKey = `${activity.name}|${activity.subcontractorId}`;
        if (!groupedMap.has(groupKey)) {
          groupedMap.set(groupKey, []);
        }
        groupedMap.get(groupKey)!.push(activity);
      });

    // Convert to array and sort by first activity's start date
    return Array.from(groupedMap.values())
      .map(group => ({
        activities: group.sort((a, b) => (a.floorLevelId || '').localeCompare(b.floorLevelId || '')),
        groupKey: (group[0].subcontractorId || '') + (group[0].name || ''),
      }))
      .sort((a, b) => {
        const aStartDate = new Date(a.activities[0].startDate).getTime();
        const bStartDate = new Date(b.activities[0].startDate).getTime();
        return aStartDate - bStartDate;
      });
  };

  const renderDayHeaders = () => {
    const items = [];

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(timechart.startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const isHoliday = isNonWorkingDay(currentDate, timechart.nonWorkingDays || timechart.publicHolidays || []);
      const isWeekend = currentDate.getDay() === 0; // Only Sunday is weekend
      const dayOfMonth = currentDate.getDate();
      const dayName = currentDate.toLocaleString('en-US', { weekday: 'short' });

      let backgroundColor = '#FFF';
      if (isHoliday) backgroundColor = '#FFE0E0';
      if (isWeekend) backgroundColor = '#F0F0F0';

      items.push(
        <View
          key={`day-${i}`}
          style={[
            styles.dayHeaderCell,
            {
              width: DAY_WIDTH,
              backgroundColor,
            },
          ]}
        >
          <Text style={styles.dayHeaderText}>{dayName}</Text>
          <Text style={styles.dateText}>{dayOfMonth}</Text>
        </View>
      );
    }

    return items;
  };

  const renderMonthHeaders = () => {
    const items = [];
    let currentMonth = '';
    let monthStartIndex = 0;
    let dayCount = 0;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(timechart.startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const monthKey = currentDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      if (monthKey !== currentMonth) {
        if (currentMonth !== '') {
          items.push(
            <View
              key={`month-${monthStartIndex}`}
              style={[
                styles.monthHeaderCell,
                { width: dayCount * DAY_WIDTH },
              ]}
            >
              <Text style={styles.monthHeaderText}>{currentMonth}</Text>
            </View>
          );
        }

        currentMonth = monthKey;
        monthStartIndex = i;
        dayCount = 1;
      } else {
        dayCount++;
      }
    }

    if (currentMonth !== '') {
      items.push(
        <View
          key={`month-${monthStartIndex}`}
          style={[
            styles.monthHeaderCell,
            { width: dayCount * DAY_WIDTH },
          ]}
        >
          <Text style={styles.monthHeaderText}>{currentMonth}</Text>
        </View>
      );
    }

    return items;
  };

  const renderDateCells = (groupedActivities: Activity | Activity[], startDay: number) => {
    const cells = [];
    // Handle both single activity (for backward compatibility) and grouped activities array
    const activitiesArray = Array.isArray(groupedActivities) ? groupedActivities : [groupedActivities];
    const primaryActivity = activitiesArray[0];
    const isGrouped = activitiesArray.length > 1;

    // Use dragActivity if this is the one being dragged, otherwise use original activity
    const displayPrimaryActivity = draggingActivityId === primaryActivity.id && dragActivity ? dragActivity : primaryActivity;
    const displayStartDay = getDaysBetween(timechart.startDate, displayPrimaryActivity.startDate);
    
    // Calculate end day - add 1 to include the end date itself
    const endDay = displayStartDay + getDaysBetween(displayPrimaryActivity.startDate, displayPrimaryActivity.endDate) + 1;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(timechart.startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const isHoliday = isNonWorkingDay(currentDate, timechart.nonWorkingDays || timechart.publicHolidays || []);
      const isWeekend = currentDate.getDay() === 0; // Only Sunday is weekend
      const isActivityDay = i >= displayStartDay && i < endDay;

      // Show activity indicator only on working days (not holidays, not weekends)
      const shouldShowActivity = isActivityDay && !isHoliday && !isWeekend;

      // Check if there's a daily log for any activity in the group and date
      const hasActivityLog = activitiesArray.some(act =>
        timechart.dailyActivityLogs?.some(
          log => log.activityId === act.id && 
                 new Date(log.date).toDateString() === currentDate.toDateString()
        )
      );

      let backgroundColor = '#FFF';
      if (isHoliday) backgroundColor = '#FFE0E0';
      if (isWeekend) backgroundColor = '#F0F0F0';

      cells.push(
        <TouchableOpacity
          key={`cell-${i}`}
          onPress={() => shouldShowActivity && handleCellDoubleTab(primaryActivity, currentDate, `cell-${primaryActivity.id}-${i}`)}
          activeOpacity={0.6}
        >
          <View
            style={[
              styles.cell,
              styles.dateCell,
              {
                width: DAY_WIDTH,
                backgroundColor,
              },
            ]}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => draggingActivityId === primaryActivity.id}
            onResponderGrant={(event) => handleActivityPressIn(primaryActivity, event)}
            onResponderMove={handleActivityPressMove}
            onResponderRelease={handleActivityPressOut}
          >
            {shouldShowActivity && (
              <>
                {isGrouped ? (
                  // Subdivided cell for multiple floor levels
                  <View style={[styles.subdivisionContainer, { height: '70%', width: '90%' }]}>
                    {activitiesArray.map((activity, idx) => {
                      const isBeingDragged = draggingActivityId === activity.id;
                      return (
                        <View
                          key={`subdivision-${activity.id}`}
                          style={[
                            styles.subdividedActivityIndicator,
                            { 
                              backgroundColor: activity.floorLevelColor,
                              flex: 1,
                              opacity: isBeingDragged ? 0.7 : 1,
                            },
                            idx < activitiesArray.length - 1 && styles.subdividedActivityIndicatorBorder,
                            activity.isCompleted && styles.completedActivityIndicator,
                          ]}
                        />
                      );
                    })}
                  </View>
                ) : (
                  // Single activity indicator
                  <View
                    style={[
                      styles.activityIndicator,
                      { 
                        backgroundColor: displayPrimaryActivity.floorLevelColor,
                        opacity: draggingActivityId === primaryActivity.id ? 0.7 : 1,
                      },
                      displayPrimaryActivity.isCompleted && styles.completedActivityIndicator,
                    ]}
                  />
                )}
                {/* Visual indicator for daily log */}
                {hasActivityLog && (
                  <View style={styles.logIndicator} />
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  const renderActivityRows = () => {
    const groupedActivities = groupActivitiesByNameAndContractor();

    return groupedActivities.map((group) => {
      const activities = group.activities;
      const primaryActivity = activities[0]; // Use first activity as primary
      const isGrouped = activities.length > 1;

      const activityStartDay = getDaysBetween(timechart.startDate, primaryActivity.startDate);
      const contractorName = timechart.subcontractors.find(
        c => c.id === primaryActivity.subcontractorId
      )?.name || 'Unassigned';

      // Get child activities for this primary activity
      const childActivities = primaryActivity.childActivityIds 
        ? timechart.activities.filter(a => primaryActivity.childActivityIds?.includes(a.id))
        : [];

      return (
        <View key={`activity-group-${group.groupKey}`}>
            {/* Parent Activity Row (Grouped if multiple floors) */}
            <View style={styles.activityRowContainer}>
              <View style={[styles.cell, styles.activityCell, { width: ACTIVITY_LABEL_WIDTH }]}>
                <Text 
                  style={[
                    styles.activityCellText,
                    primaryActivity.isCompleted && styles.completedActivityCellText
                  ]} 
                  numberOfLines={2}
                >
                  {primaryActivity.name}
                  {isGrouped && <Text style={{ fontSize: 11, color: '#999' }}> ({activities.length})</Text>}
                </Text>
              </View>

              <View style={[styles.cell, styles.contractorCell, { width: CONTRACTOR_LABEL_WIDTH }]}>
                {/* Name row: color dot + contractor name */}
                <View style={styles.contractorNameRow}>
                  {!isGrouped ? (
                    <View
                      style={[
                        styles.contractorColorDot,
                        { backgroundColor: primaryActivity.floorLevelColor },
                      ]}
                    />
                  ) : (
                    <View style={[styles.contractorColorDot, { width: 8, height: 8, borderRadius: 4, backgroundColor: primaryActivity.floorLevelColor }]} />
                  )}
                  <Text style={styles.contractorCellText} numberOfLines={1}>
                    {contractorName}
                  </Text>
                </View>
                {/* Action buttons row */}
                <View style={styles.contractorActionsRow}>
                  <TouchableOpacity 
                    onPress={() => {
                      if (user && !canPerformAction(user.role, 'canMarkActivityComplete')) {
                        Alert.alert('Permission Denied', 'You do not have permission to mark activities as complete.');
                        return;
                      }
                      // Determine target state: if ALL are completed, uncomplete all; otherwise complete all
                      const allCompleted = activities.every(act => act.isCompleted);
                      activities.forEach(act => {
                        onUpdateActivity(act.id, { ...act, isCompleted: !allCompleted });
                      });
                    }}
                  >
                    <Text style={[styles.completeActivityText, primaryActivity.isCompleted && styles.completeActivityTextActive]}>
                      ✓
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      if (user && !canPerformAction(user.role, 'canMarkActivityStarted')) {
                        Alert.alert('Permission Denied', 'You do not have permission to mark activities as started.');
                        return;
                      }
                      // Determine target state: if ALL are started, unstart all; otherwise start all
                      const allStarted = activities.every(act => act.isStarted);
                      activities.forEach(act => {
                        onUpdateActivity(act.id, { ...act, isStarted: !allStarted });
                      });
                    }}
                    style={[styles.startedButton, primaryActivity.isStarted && styles.startedButtonActive]}
                  >
                    <Text style={[styles.startedButtonText, primaryActivity.isStarted && styles.startedButtonTextActive]}>
                      {primaryActivity.isStarted ? 'Started' : 'Start'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      if (user && !canPerformAction(user.role, 'canDeleteActivity')) {
                        Alert.alert('Permission Denied', 'You do not have permission to delete activities.');
                        return;
                      }
                      activities.forEach(act => {
                        onRemoveActivity(act.id);
                      });
                    }}
                  >
                    <Text style={styles.removeActivityText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.chartArea}>
                {renderDateCells(activities, activityStartDay)}
              </View>
            </View>

            {/* Child Activity Rows */}
            {childActivities.map((childActivity) => {
              const childStartDay = getDaysBetween(timechart.startDate, childActivity.startDate);
              return (
                <View key={`activity-${childActivity.id}`} style={[styles.activityRowContainer, styles.childActivityRow]}>
                  <View style={[styles.cell, styles.activityCell, { width: ACTIVITY_LABEL_WIDTH }]}>
                    <Text 
                      style={[
                        styles.activityCellText,
                        styles.childActivityCellText,
                        childActivity.isCompleted && styles.completedActivityCellText
                      ]} 
                      numberOfLines={2}
                    >
                      ↳ {childActivity.name}
                    </Text>
                  </View>

                  <View style={[styles.cell, styles.contractorCell, { width: CONTRACTOR_LABEL_WIDTH }]}>
                    {/* Name row */}
                    <View style={styles.contractorNameRow}>
                      <View
                        style={[
                          styles.contractorColorDot,
                          { backgroundColor: childActivity.floorLevelColor, opacity: 0.6 },
                        ]}
                      />
                      <Text style={styles.contractorCellText} numberOfLines={1}>
                        {contractorName}
                      </Text>
                    </View>
                    {/* Action buttons row */}
                    <View style={styles.contractorActionsRow}>
                      <TouchableOpacity 
                        onPress={() => {
                          if (user && !canPerformAction(user.role, 'canMarkActivityComplete')) {
                            Alert.alert('Permission Denied', 'You do not have permission to mark activities as complete.');
                            return;
                          }
                          handleToggleActivityCompletion(childActivity.id);
                        }}
                      >
                        <Text style={[styles.completeActivityText, childActivity.isCompleted && styles.completeActivityTextActive]}>
                          ✓
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => {
                          if (user && !canPerformAction(user.role, 'canMarkActivityStarted')) {
                            Alert.alert('Permission Denied', 'You do not have permission to mark activities as started.');
                            return;
                          }
                          handleToggleActivityStarted(childActivity.id);
                        }}
                        style={[styles.startedButton, childActivity.isStarted && styles.startedButtonActive]}
                      >
                        <Text style={[styles.startedButtonText, childActivity.isStarted && styles.startedButtonTextActive]}>
                          {childActivity.isStarted ? 'Started' : 'Start'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => {
                          if (user && !canPerformAction(user.role, 'canDeleteActivity')) {
                            Alert.alert('Permission Denied', 'You do not have permission to delete activities.');
                            return;
                          }
                          onRemoveActivity(primaryActivity.id);
                        }}
                      >
                        <Text style={styles.removeActivityText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.chartArea}>
                    {renderDateCells(childActivity, childStartDay)}
                  </View>
                </View>
              );
            })}
          </View>
        );
    });
  };

  // Memoize activity rows to ensure they update when timechart changes
  const memoizedActivityRows = useMemo(() => renderActivityRows(), [timechart.activities, timechart.subcontractors, timechart.startDate, timechart.nonWorkingDays, timechart.publicHolidays, timechart.floorLevels, draggingActivityId, dragActivity]);

  return (
    <View style={styles.container}>
      {/* Control Panel Header */}
      <View style={styles.controlPanel}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            user && !canPerformAction(user.role, 'canAddActivity') && styles.disabledButton,
          ]}
          onPress={() => {
            if (user && !canPerformAction(user.role, 'canAddActivity')) {
              Alert.alert('Permission Denied', 'You do not have permission to add activities.');
              return;
            }
            setShowAddActivityModal(true);
          }}
          disabled={user ? !canPerformAction(user.role, 'canAddActivity') : false}
        >
          <Text style={styles.controlButtonText}>+ Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.controlButton,
            user && !canPerformAction(user.role, 'canAddHoliday') && styles.disabledButton,
          ]}
          onPress={() => {
            if (user && !canPerformAction(user.role, 'canAddHoliday')) {
              Alert.alert('Permission Denied', 'You do not have permission to add non-working days.');
              return;
            }
            setShowAddHolidayModal(true);
          }}
          disabled={user ? !canPerformAction(user.role, 'canAddHoliday') : false}
        >
          <Text style={styles.controlButtonText}>+ Non-Working Day</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.controlButton,
            user && !canPerformAction(user.role, 'canAddSubcontractor') && styles.disabledButton,
          ]}
          onPress={() => {
            if (user && !canPerformAction(user.role, 'canAddSubcontractor')) {
              Alert.alert('Permission Denied', 'You do not have permission to add contractors.');
              return;
            }
            setShowAddContractorModal(true);
          }}
          disabled={user ? !canPerformAction(user.role, 'canAddSubcontractor') : false}
        >
          <Text style={styles.controlButtonText}>+ Contractor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowFloorLevelModal(true)}
        >
          <Text style={styles.controlButtonText}>+ Floor Level</Text>
        </TouchableOpacity>
        {/* Only show Manage button for users with edit permissions */}
        {!user || canPerformAction(user.role, 'canEdit') ? (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowManagePanelModal(true)}
          >
            <Text style={styles.controlButtonText}>Manage</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Timechart */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ width: Math.max(chartWidth, width - 16) }}
      >
        <View>
          {/* Month Header Row */}
          <View style={styles.monthHeaderRow}>
            <View style={[styles.cell, styles.headerLabelCell, { width: ACTIVITY_LABEL_WIDTH }]}>
              <Text style={styles.monthPlaceholderText}></Text>
            </View>
            <View style={[styles.cell, styles.headerLabelCell, { width: CONTRACTOR_LABEL_WIDTH }]}>
              <Text style={styles.monthPlaceholderText}></Text>
            </View>
            <View style={styles.monthHeaderDateContent}>
              {renderMonthHeaders()}
            </View>
          </View>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={[styles.cell, styles.headerLabelCell, { width: ACTIVITY_LABEL_WIDTH }]}>
              <Text style={styles.headerCellText}>ACTIVITY</Text>
            </View>
            <View style={[styles.cell, styles.headerLabelCell, { width: CONTRACTOR_LABEL_WIDTH }]}>
              <Text style={styles.headerCellText}>CONTRACTOR</Text>
            </View>
            <View style={styles.headerDateContent}>
              {renderDayHeaders()}
            </View>
          </View>

          {/* Activity Rows */}
          <View>
            {(timechart.activities || []).length > 0 ? (
              memoizedActivityRows
            ) : (
              <View style={[styles.cell, { padding: 16, marginTop: 10 }]}>
                <Text style={styles.emptyText}>No activities added yet. Tap "+ Activity" to get started.</Text>
              </View>
            )}
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={[styles.cell, { width: ACTIVITY_LABEL_WIDTH + CONTRACTOR_LABEL_WIDTH }]} />
            <View style={styles.legendContent}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#FFE0E0' }]} />
                <Text style={styles.legendText}>Non-Working Day</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#F0F0F0' }]} />
                <Text style={styles.legendText}>Weekend</Text>
              </View>
              
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
            </View>
          </View>

          {/* Help Text */}
          <View style={styles.helpTextRow}>
            <Text style={styles.helpText}>💡 Drag activity bars left/right to change dates</Text>
          </View>
          <View style={styles.helpTextRow}>
            <Text style={styles.helpText}>📝 Long-press an activity bar to log daily work notes & photos</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Activity Modal */}
      <Modal
        visible={showAddActivityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddActivityModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddActivityModal(false)}>
                <Text style={styles.closeButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Activity</Text>
              <TouchableOpacity onPress={handleAddActivity}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formSection}>
                <Text style={styles.label}>Activity Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Excavation, Framing"
                  placeholderTextColor="#999"
                  value={activityName}
                  onChangeText={setActivityName}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Optional description"
                  placeholderTextColor="#999"
                  value={activityDescription}
                  onChangeText={setActivityDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formSection}>
                <DatePickerField
                  label="Start Date *"
                  value={startActivityDate}
                  onChange={setStartActivityDate}
                  minDate={new Date(timechart.startDate)}
                  maxDate={new Date(timechart.endDate)}
                />
              </View>

              <View style={styles.formSection}>
                <DatePickerField
                  label="End Date *"
                  value={endActivityDate}
                  onChange={setEndActivityDate}
                  minDate={new Date(timechart.startDate)}
                  maxDate={new Date(timechart.endDate)}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Assigned Contractor *</Text>
                <View style={styles.pickerContainer}>
                  {timechart.subcontractors.length === 0 ? (
                    <Text style={styles.noSubcontractorText}>No contractors available. Add one first.</Text>
                  ) : (
                    timechart.subcontractors.map((contractor) => (
                      <TouchableOpacity
                        key={contractor.id}
                        style={[
                          styles.contractorOption,
                          selectedSubcontractor === contractor.id && styles.contractorOptionSelected,
                        ]}
                        onPress={() => setSelectedSubcontractor(contractor.id)}
                      >
                        <Text
                          style={[
                            styles.contractorOptionText,
                            selectedSubcontractor === contractor.id && styles.contractorOptionTextSelected,
                          ]}
                        >
                          {contractor.name}
                        </Text>
                        {selectedSubcontractor === contractor.id && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Floor Level *</Text>
                <View style={styles.pickerContainer}>
                  {!timechart.floorLevels || timechart.floorLevels.length === 0 ? (
                    <Text style={styles.noSubcontractorText}>No floor levels available.</Text>
                  ) : (
                    timechart.floorLevels.map((floor) => (
                      <TouchableOpacity
                        key={floor.id}
                        style={[
                          styles.contractorOption,
                          selectedFloorLevel === floor.id && styles.contractorOptionSelected,
                        ]}
                        onPress={() => setSelectedFloorLevel(floor.id)}
                      >
                        <View
                          style={[
                            styles.contractorOptionColor,
                            { backgroundColor: floor.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.contractorOptionText,
                            selectedFloorLevel === floor.id && styles.contractorOptionTextSelected,
                          ]}
                        >
                          {floor.name}
                        </Text>
                        {selectedFloorLevel === floor.id && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>

              {/* Child Activity Section */}
              <View style={styles.formSection}>
                <View style={styles.childActivityToggleContainer}>
                  <TouchableOpacity
                    style={[styles.checkboxSquare, hasChildActivity && styles.checkboxSquareChecked]}
                    onPress={() => setHasChildActivity(!hasChildActivity)}
                  >
                    {hasChildActivity && <Text style={styles.checkboxCheckmark}>✓</Text>}
                  </TouchableOpacity>
                  <Text style={styles.label}>Add Child Activity (Optional)</Text>
                </View>
              </View>

              {hasChildActivity && (
                <>
                  <View style={styles.formSection}>
                    <Text style={styles.label}>Child Activity Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Inspection, Finishing"
                      placeholderTextColor="#999"
                      value={childActivityName}
                      onChangeText={setChildActivityName}
                    />
                    <Text style={styles.helperText}>Child activity will start immediately after parent activity ends</Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.label}>Child Activity Duration (days) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 3"
                      placeholderTextColor="#999"
                      value={childActivityDuration}
                      onChangeText={setChildActivityDuration}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}

              <View style={styles.divider} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Non-Working Day Modal */}
      <Modal
        visible={showAddHolidayModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddHolidayModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddHolidayModal(false)}>
                <Text style={styles.closeButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Non-Working Day</Text>
              <TouchableOpacity onPress={handleAddHoliday}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {/* <View style={styles.formSection}>
                <Text style={styles.label}>Non-Working Day Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Christmas, New Year"
                  placeholderTextColor="#999"
                  value={holidayName}
                  onChangeText={setHolidayName}
                />
              </View> */}

              <View style={styles.formSection}>
                <DatePickerField
                  label="Date *"
                  value={holidayDate}
                  onChange={setHolidayDate}
                  minDate={new Date(timechart.startDate)}
                  maxDate={new Date(timechart.endDate)}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Day Type *</Text>
                <View style={holidayTypeStyles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      holidayTypeStyles.optionButton,
                      holidayType === 'non-working-day' && holidayTypeStyles.optionButtonSelected,
                      { borderColor: '#FFB0B0' },
                    ]}
                    onPress={() => setHolidayType('non-working-day')}
                  >
                    <View style={[holidayTypeStyles.colorSwatch, { backgroundColor: '#FFE0E0' }]} />
                    <Text style={[
                      holidayTypeStyles.optionLabel,
                      holidayType === 'non-working-day' && holidayTypeStyles.optionLabelSelected,
                    ]}>Non-Working Day</Text>
                    {holidayType === 'non-working-day' && (
                      <Text style={holidayTypeStyles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      holidayTypeStyles.optionButton,
                      holidayType === 'public-holiday' && holidayTypeStyles.optionButtonSelected,
                      { borderColor: '#FF7070' },
                    ]}
                    onPress={() => setHolidayType('public-holiday')}
                  >
                    <View style={[holidayTypeStyles.colorSwatch, { backgroundColor: '#FFB3B3' }]} />
                    <Text style={[
                      holidayTypeStyles.optionLabel,
                      holidayType === 'public-holiday' && holidayTypeStyles.optionLabelSelected,
                    ]}>Public Holiday</Text>
                    {holidayType === 'public-holiday' && (
                      <Text style={holidayTypeStyles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Contractor Modal */}
      <Modal
        visible={showAddContractorModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddContractorModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddContractorModal(false)}>
                <Text style={styles.closeButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Contractor</Text>
              <TouchableOpacity onPress={handleAddContractor}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formSection}>
                <Text style={styles.label}>Contractor Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., ABC Construction Ltd."
                  placeholderTextColor="#999"
                  value={contractorName}
                  onChangeText={setContractorName}
                />
              </View>

              <View style={styles.divider} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Manage Panel Modal */}
      <Modal
        visible={showManagePanelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManagePanelModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowManagePanelModal(false)}>
                <Text style={styles.closeButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Manage Project</Text>
              <Text style={styles.doneButton}></Text>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.sectionHeading}>Non-Working Days ({(timechart.nonWorkingDays || timechart.publicHolidays || []).length})</Text>
              {(timechart.nonWorkingDays || timechart.publicHolidays || []).length === 0 ? (
                <Text style={styles.emptyText}>No non-working days added</Text>
              ) : (
                (timechart.nonWorkingDays || timechart.publicHolidays || []).map((day) => (
                  <View key={day.id} style={styles.manageItem}>
                    <View>
                      <Text style={styles.manageItemName}>{day.name}</Text>
                      <Text style={styles.manageItemDate}>
                        {new Date(day.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => {
                        // Check if user has permission to delete non-working days
                        if (user && !canPerformAction(user.role, 'canDeleteHoliday')) {
                          Alert.alert('Permission Denied', 'You do not have permission to delete non-working days.');
                          return;
                        }
                        const removeFunction = onRemoveNonWorkingDay || onRemoveHoliday;
                        if (removeFunction) {
                          removeFunction(day.id);
                        }
                      }}
                    >
                      <Text style={styles.removeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <Text style={[styles.sectionHeading, { marginTop: 20 }]}>
                Contractors ({timechart.subcontractors.length})
              </Text>
              {timechart.subcontractors.length === 0 ? (
                <Text style={styles.emptyText}>No contractors added</Text>
              ) : (
                timechart.subcontractors.map((contractor) => (
                  <View key={contractor.id} style={styles.manageItem}>
                    <Text style={styles.manageItemName}>{contractor.name}</Text>
                    <TouchableOpacity onPress={() => onRemoveSubcontractor(contractor.id)}>
                      <Text style={styles.removeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <Text style={[styles.sectionHeading, { marginTop: 20 }]}>
                Floor Levels ({(timechart.floorLevels || []).length})
              </Text>
              {!timechart.floorLevels || timechart.floorLevels.length === 0 ? (
                <Text style={styles.emptyText}>No floor levels added</Text>
              ) : (
                timechart.floorLevels.map((floor) => (
                  <View key={floor.id} style={styles.manageItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View
                        style={[
                          styles.manageColorDot,
                          { backgroundColor: floor.color },
                        ]}
                      />
                      <Text style={styles.manageItemName}>{floor.name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => handleEditFloorLevel(floor)}>
                        <Text style={styles.editButton}>✎</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onRemoveFloorLevel(floor.id)}>
                        <Text style={styles.removeButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              <View style={styles.divider} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floor Level Modal */}
      <Modal
        visible={showFloorLevelModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelEditFloorLevel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancelEditFloorLevel}>
                <Text style={styles.closeButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{editingFloorLevelId ? 'Edit Floor Level' : 'Add Floor Level'}</Text>
              <TouchableOpacity onPress={handleAddOrUpdateFloorLevel}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formSection}>
                <Text style={styles.label}>Floor Level Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Ground Floor, First Floor"
                  placeholderTextColor="#999"
                  value={floorLevelName}
                  onChangeText={setFloorLevelName}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Color</Text>
                <View style={styles.colorPickerContainer}>
                  {FLOOR_LEVEL_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        floorLevelColor === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => setFloorLevelColor(color)}
                    >
                      {floorLevelColor === color && (
                        <Text style={styles.colorCheckmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.divider} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Daily Activity Log Modal */}
      <Modal
        visible={showDailyLogModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDailyLogModal(false)}
      >
        <SafeAreaView style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDailyLogModal(false)}>
                  <Text style={styles.closeButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Daily Activity Log</Text>
                <TouchableOpacity onPress={handleSaveDailyLog}>
                  <Text style={styles.doneButton}>Save</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formContainer}>
                {/* Activity and Date Info */}
                {selectedActivityForLog && selectedLogDate && (
                  <View style={styles.logInfoContainer}>
                    <View style={styles.logInfoRow}>
                      <Text style={styles.logLabel}>Activity:</Text>
                      <Text style={styles.logValue}>{selectedActivityForLog.name}</Text>
                    </View>
                    <View style={styles.logInfoRow}>
                      <Text style={styles.logLabel}>Subcontractor:</Text>
                      <Text style={styles.logValue}>{selectedActivityForLog.subcontractorName}</Text>
                    </View>
                    <View style={styles.logInfoRow}>
                      <Text style={styles.logLabel}>Date:</Text>
                      <Text style={styles.logValue}>
                        {selectedLogDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </Text>
                    </View>
                    <View style={[styles.logInfoRow, { alignItems: 'center' }]}>
                      <View
                        style={[
                          styles.floorLevelIndicator,
                          { backgroundColor: selectedActivityForLog.floorLevelColor },
                        ]}
                      />
                      <Text style={styles.logLabel}>Floor Level:</Text>
                      <Text style={styles.logValue}>{selectedActivityForLog.floorLevelName}</Text>
                    </View>
                  </View>
                )}

                {/* Notes Section */}
                <View style={styles.formSection}>
                  <Text style={styles.label}>Work Notes *</Text>
                  <Text style={styles.helperText}>
                    Describe the construction work completed today
                  </Text>
                  <TextInput
                    style={[styles.input, styles.notesInput]}
                    placeholder="Enter work notes, progress, observations, etc."
                    placeholderTextColor="#999"
                    multiline={true}
                    numberOfLines={6}
                    value={dailyLogNotes}
                    onChangeText={setDailyLogNotes}
                    textAlignVertical="top"
                  />
                </View>

                {/* Images Section */}
                <View style={styles.formSection}>
                  <Text style={styles.label}>Work Photos</Text>
                  <Text style={styles.helperText}>
                    Add photos of the construction work (up to 5 images)
                  </Text>

                  {/* Image Preview Grid */}
                  {dailyLogImages.length > 0 && (
                    <View style={styles.imageGrid}>
                      {dailyLogImages.map((imageUri, index) => (
                        <View key={index} style={styles.imageContainer}>
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.imageThumbnail}
                          />
                          <TouchableOpacity
                            style={styles.imageRemoveButton}
                            onPress={() => handleRemoveImage(index)}
                          >
                            <Text style={styles.imageRemoveText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Add Image Button */}
                  {dailyLogImages.length < 5 && (
                    <TouchableOpacity
                      style={styles.addImageButton}
                      onPress={handleAddImage}
                    >
                      <Text style={styles.addImageButtonText}>+ Add Photo</Text>
                    </TouchableOpacity>
                  )}

                  {dailyLogImages.length >= 5 && (
                    <Text style={styles.maxImagesText}>
                      Maximum 5 images reached
                    </Text>
                  )}
                </View>

                <View style={styles.divider} />
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  controlPanel: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  controlButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  monthHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E8F1FF',
    borderBottomWidth: 2,
    borderBottomColor: '#0066CC',
  },
  monthHeaderDateContent: {
    flexDirection: 'row',
  },
  monthHeaderCell: {
    borderRightWidth: 1,
    borderRightColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    height: 40,
    minHeight: 40,
  },
  monthHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0066CC',
    textAlign: 'center',
  },
  monthPlaceholderText: {
    fontSize: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#0066CC',
    borderBottomWidth: 2,
    borderBottomColor: '#0052A3',
  },
  headerDateContent: {
    flexDirection: 'row',
  },
  cell: {
    borderRightWidth: 1,
    borderRightColor: '#DDD',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerLabelCell: {
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  dayHeaderCell: {
    borderRightWidth: 1,
    borderRightColor: '#CCC',
    borderBottomWidth: 2,
    borderBottomColor: '#0052A3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    height: 50,
    minHeight: 50,
  },
  dayHeaderText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#333',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066CC',
    marginTop: 2,
  },
  activityRowContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    height: 60,
    minHeight: 60,
  },
  activityCell: {
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 2,
    borderRightColor: '#0066CC',
  },
  activityCellText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    lineHeight: 16,
  },
  completedActivityCellText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
    color: '#999',
  },
  contractorCell: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRightWidth: 2,
    borderRightColor: '#0066CC',
    flexDirection: 'column',
  },
  contractorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  contractorActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 4,
  },
  contractorColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  contractorCellText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  removeActivityText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: 'bold',
  },
  completeActivityText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
    marginRight: 4,
  },
  completeActivityTextActive: {
    color: '#4CAF50',
  },
  startedButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startedButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E8B57',
  },
  startedButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  startedButtonTextActive: {
    color: '#FFF',
  },
  dateCell: {
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 60,
    minHeight: 60,
  },
  chartArea: {
    flex: 1,
    minHeight: 60,
    flexDirection: 'row',
  },
  activityIndicator: {
    width: '90%',
    height: '70%',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  completedActivityIndicator: {
    opacity: 0.5,
    backgroundColor: '#CCCCCC',
  },
  legendRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 2,
    borderTopColor: '#DDD',
    backgroundColor: '#F9F9F9',
  },
  legendContent: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  closeButton: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  doneButton: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    overflow: 'hidden',
  },
  contractorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  contractorOptionSelected: {
    backgroundColor: '#F0F5FF',
  },
  contractorOptionColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  contractorOptionText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  contractorOptionTextSelected: {
    color: '#0066CC',
    fontWeight: '600',
  },
  checkmark: {
    color: '#0066CC',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noSubcontractorText: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#999',
    fontSize: 13,
  },
  divider: {
    height: 100,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    marginTop: 12,
  },
  manageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  manageItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  manageItemDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  manageColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  removeButton: {
    fontSize: 18,
    color: '#FF4444',
    fontWeight: 'bold',
  },
  editButton: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: 'bold',
  },
  colorPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  colorOption: {
    width: '24%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#333',
    borderWidth: 3,
  },
  colorCheckmark: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  helpTextRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F0F8FF',
    borderTopWidth: 1,
    borderTopColor: '#CCE5FF',
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#0052A3',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Daily Activity Log Modal Styles
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000CC',
  },
  logInfoContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  logInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  logLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    width: 100,
  },
  logValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  floorLevelIndicator: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  helperText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 120,
    paddingTop: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  imageContainer: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    position: 'relative',
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageRemoveText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addImageButton: {
    backgroundColor: '#E8F1FF',
    borderWidth: 2,
    borderColor: '#0066CC',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addImageButtonText: {
    color: '#0066CC',
    fontSize: 13,
    fontWeight: '600',
  },
  maxImagesText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  logIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  // Child Activity Styles
  childActivityToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#0066CC',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxSquareChecked: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  checkboxCheckmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Child Activity Styles
  childActivityRow: {
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 3,
    borderLeftColor: '#0066CC',
  },
  childActivityCellText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#555',
    paddingLeft: 8,
  },
  // Activity Grouping and Cell Subdivision Styles
  subdivisionContainer: {
    flexDirection: 'column',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  subdividedActivityIndicator: {
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  subdividedActivityIndicatorBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
  },
});
