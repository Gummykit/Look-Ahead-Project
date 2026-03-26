import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
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

const datePickerStyles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0066CC',
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
  },
  buttonText: { flex: 1, fontSize: 15, color: '#1A1A2E', fontWeight: '500' },
  calendarIcon: { fontSize: 18 },
  chevron: { fontSize: 11, color: '#0066CC' },
  webWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0066CC',
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
    overflow: 'hidden',
  },
  webLabel: { flex: 1, fontSize: 15, color: '#1A1A2E', fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  doneText: { fontSize: 16, color: '#0066CC', fontWeight: '700' },
});

const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, value, onChange, minDate, maxDate }) => {
  const [showPicker, setShowPicker] = useState(false);

  const dateValue = value ? new Date(value + 'T12:00:00') : (minDate ?? new Date());

  const handleNativeChange = (_: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, '0');
      const d = String(selected.getDate()).padStart(2, '0');
      onChange(`${y}-${m}-${d}`);
    }
  };

  const displayText = value
    ? new Date(value + 'T12:00:00').toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : 'Tap to choose date…';

  if (Platform.OS === 'web') {
    // On web: render a visible styled button that overlays a transparent
    // <input type="date"> so clicking anywhere on it opens the browser
    // calendar — no editable text field visible.
    return (
      <View style={datePickerStyles.container}>
        <Text style={datePickerStyles.label}>{label}</Text>
        <View style={datePickerStyles.webWrapper}>
          <Text style={datePickerStyles.calendarIcon}>📅</Text>
          <Text style={[datePickerStyles.webLabel, !value && { color: '#999' }]}>
            {displayText}
          </Text>
          <Text style={datePickerStyles.chevron}>▼</Text>
          {/* Transparent date input sits on top — clicking it opens the native browser calendar */}
          <input
            type="date"
            value={value}
            min={minDate ? minDate.toISOString().split('T')[0] : undefined}
            max={maxDate ? maxDate.toISOString().split('T')[0] : undefined}
            onChange={(e: any) => onChange(e.target.value)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
            } as any}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={datePickerStyles.container}>
      <Text style={datePickerStyles.label}>{label}</Text>
      <TouchableOpacity style={datePickerStyles.button} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
        <Text style={datePickerStyles.calendarIcon}>📅</Text>
        <Text style={[datePickerStyles.buttonText, !value && { color: '#999' }]}>{displayText}</Text>
        <Text style={datePickerStyles.chevron}>▼</Text>
      </TouchableOpacity>

      {showPicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide">
          <View style={datePickerStyles.modalOverlay}>
            <View style={datePickerStyles.modalCard}>
              <View style={datePickerStyles.modalHeader}>
                <Text style={datePickerStyles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={datePickerStyles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="inline"
                minimumDate={minDate}
                maximumDate={maxDate}
                onChange={handleNativeChange}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
      )}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={handleNativeChange}
        />
      )}
    </View>
  );
};



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

const contractorModalStyles = StyleSheet.create({
  emptyState: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  contractorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCE5FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
  },
  contractorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066CC',
  },
  contractorRowName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 12,
    color: '#CC0000',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nameInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  contractorRowEditing: {
    borderColor: '#0066CC',
    backgroundColor: '#E8F4FF',
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '700',
  },
  cancelEditButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditButtonText: {
    fontSize: 14,
    color: '#666',
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
  onUpdateSubcontractor: (id: string, name: string) => void;
  onAddActivity: (activity: any) => void;
  /** Batch-add multiple activities in a single state update (used for parent + linked activities). */
  onAddActivities?: (activities: any[]) => void;
  onRemoveActivity: (id: string) => void;
  onUpdateActivity: (id: string, activity: any) => void;
  onBatchUpdateActivities?: (updates: Array<{ id: string; changes: any }>) => void;
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
  onUpdateSubcontractor,
  onAddActivity,
  onAddActivities,
  onRemoveActivity,
  onUpdateActivity,
  onBatchUpdateActivities,
  onAddFloorLevel,
  onUpdateFloorLevel,
  onRemoveFloorLevel,
  onAddOrUpdateDailyLog,
  onRemoveDailyLog,
}) => {
  const { width } = Dimensions.get('window');
  const DAY_WIDTH = 50;
  const ACTIVITY_LABEL_WIDTH = 150;
  const CONTRACTOR_LABEL_WIDTH = 200;

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

  // Toggle between subdivided tile view and count number view for grouped activities
  const [groupedCellView, setGroupedCellView] = useState<'tiles' | 'numbers'>('tiles');

  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [startActivityDate, setStartActivityDate] = useState(
    new Date(timechart.startDate).toISOString().split('T')[0]
  );
  const [activityDuration, setActivityDuration] = useState('7');
  // Multi-contractor selection for Add/Edit Activity modal
  // (replaces the old single selectedSubcontractor state)
  const [selectedSubcontractorIds, setSelectedSubcontractorIds] = useState<string[]>([]);
  // Keep the old single-select state for any legacy paths that still reference it
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<string | null>(
    timechart.subcontractors.length > 0 ? timechart.subcontractors[0].id : null
  );
  const [selectedFloorLevel, setSelectedFloorLevel] = useState<string | null>(
    (timechart.floorLevels && timechart.floorLevels.length > 0) ? timechart.floorLevels[0].id : null
  );

  const [contractorName, setContractorName] = useState('');
  const [editingContractorId, setEditingContractorId] = useState<string | null>(null);
  // Inline new-contractor entry inside the Add/Edit Activity modal
  const [inlineNewContractorName, setInlineNewContractorName] = useState('');

  // ── Linked Activities state ────────────────────────────────────────────────
  // Each entry is a pending linked activity to be created alongside the parent.
  interface LinkedActivityEntry {
    id: string; // temp key for the list
    name: string;
    offsetDays: number; // offset from parent end date (+1 = 1 day after, -1 = 1 day before, etc.)
    duration: number; // duration in days
    floorLevelId: string;
    subcontractorIds: string[];
  }
  const [linkedActivities, setLinkedActivities] = useState<LinkedActivityEntry[]>([]);
  // Ref to hold the latest linkedActivities value (avoids stale closure in handleAddActivity)
  const linkedActivitiesRef = useRef<LinkedActivityEntry[]>([]);
  // Keep ref in sync with state
  useEffect(() => {
    linkedActivitiesRef.current = linkedActivities;
  }, [linkedActivities]);
  // State for the currently-open "Add Linked Activity" inline form (-1 = none)
  const [addingLinkedActivityIndex, setAddingLinkedActivityIndex] = useState<number | null>(null);
  // Form state for the linked activity being drafted
  const [linkedName, setLinkedName] = useState('');
  const [linkedOffsetDays, setLinkedOffsetDays] = useState(1);
  const [linkedCustomOffset, setLinkedCustomOffset] = useState('');
  const [linkedUseCustomOffset, setLinkedUseCustomOffset] = useState(false);
  const [linkedDuration, setLinkedDuration] = useState('7');
  const [linkedFloorLevelId, setLinkedFloorLevelId] = useState<string>('');
  const [linkedSubcontractorIds, setLinkedSubcontractorIds] = useState<string[]>([]);
  // ──────────────────────────────────────────────────────────────────────────
  
  // Activity Linking state (for linking existing activities together)
  const [showLinkActivityModal, setShowLinkActivityModal] = useState(false);
  const [linkingSourceActivityId, setLinkingSourceActivityId] = useState<string | null>(null); // Activity being edited/created
  const [selectedLinkTargetActivityId, setSelectedLinkTargetActivityId] = useState<string | null>(null); // Target activity to link to
  const [linkOffsetDays, setLinkOffsetDays] = useState(0);
  const [linkUseCustomOffset, setLinkUseCustomOffset] = useState(false);
  const [linkCustomOffset, setLinkCustomOffset] = useState('');
  // ──────────────────────────────────────────────────────────────────────────
  
  // Floor level management state
  const [floorLevelName, setFloorLevelName] = useState('');
  const [floorLevelColor, setFloorLevelColor] = useState('#FF6B6B');
  const [editingFloorLevelId, setEditingFloorLevelId] = useState<string | null>(null);
  
  // Drag and drop state
  const [draggingActivityId, setDraggingActivityId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragActivity, setDragActivity] = useState<Activity | null>(null);

  // Segment-level drag state (for dragging a single floor segment within a grouped block)
  const [draggingSegmentId, setDraggingSegmentId] = useState<string | null>(null);
  const [segmentDragStartX, setSegmentDragStartX] = useState(0);
  const [segmentDragActivity, setSegmentDragActivity] = useState<Activity | null>(null);
  // Refs mirror the state above so move/release handlers always read the latest
  // values even when captured inside a stale useMemo closure.
  const segmentDragActivityRef = React.useRef<Activity | null>(null);
  const segmentDragStartXRef = React.useRef<number>(0);
  const draggingSegmentIdRef = React.useRef<string | null>(null);
  // Long-press timer for segment drag initiation
  const segmentLongPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Daily activity logging state
  const [showDailyLogModal, setShowDailyLogModal] = useState(false);
  const [selectedActivityForLog, setSelectedActivityForLog] = useState<Activity | null>(null);
  const [selectedLogDate, setSelectedLogDate] = useState<Date | null>(null);
  const [dailyLogNotes, setDailyLogNotes] = useState('');
  const [dailyLogImages, setDailyLogImages] = useState<string[]>([]);
  
  // Edit activity state
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Floor picker state — shown when editing a grouped row so the user can select which floor to edit
  const [showFloorPickerForEdit, setShowFloorPickerForEdit] = useState(false);
  const [floorPickerActivities, setFloorPickerActivities] = useState<Activity[]>([]);

  // Floor filter state — null means "show all floors"
  const [activeFloorFilter, setActiveFloorFilter] = useState<string | null>(null);

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

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🟡 [ADD-ACTIVITY] handleAddActivity called');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🟡 [ADD-ACTIVITY] Current state:', {
      editingActivityId,
      activityName,
      linkingSourceActivityId,
    });

    // If the linked-activity inline form is still open, auto-confirm it before saving
    // so the user's entered data isn't silently lost when they press "Done".
    if (addingLinkedActivityIndex !== null) {
      if (!linkedName.trim()) {
        Alert.alert('Error', 'Please enter a name for the linked activity, or cancel it before saving.');
        return;
      }
      if (!linkedFloorLevelId) {
        Alert.alert('Error', 'Please select a floor level for the linked activity, or cancel it before saving.');
        return;
      }
      const offsetVal = linkedUseCustomOffset ? (parseInt(linkedCustomOffset) || 1) : linkedOffsetDays;
      const durationVal = parseInt(linkedDuration) || 1;
      const autoEntry: LinkedActivityEntry = {
        id: `linked-${Date.now()}-${Math.random()}`,
        name: linkedName.trim(),
        offsetDays: offsetVal,
        duration: durationVal,
        floorLevelId: linkedFloorLevelId,
        subcontractorIds: linkedSubcontractorIds,
      };
      // Use updated list directly in this call (state update is async so we can't rely on it)
      const allLinked = [...linkedActivities, autoEntry];

      // Reset inline form state
      setAddingLinkedActivityIndex(null);
      setLinkedName('');
      setLinkedOffsetDays(1);
      setLinkedCustomOffset('');
      setLinkedUseCustomOffset(false);
      setLinkedDuration('7');
      setLinkedFloorLevelId('');
      setLinkedSubcontractorIds([]);

      // Continue submission with the auto-confirmed list
      // (call a helper that accepts the list directly, bypassing the stale closure)
      _submitActivity(allLinked);
      return;
    }

    // Read from ref to get the latest value (avoids stale closure from async setState)
    console.log('🟢 [Add] Using linkedActivitiesRef.current with length:', linkedActivitiesRef.current.length);
    _submitActivity(linkedActivitiesRef.current);
  };

  // Internal helper — separated so that auto-confirm can pass the fresh linked list
  // without waiting for setState to flush.
  const _submitActivity = (confirmedLinked: LinkedActivityEntry[]) => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🟡 [SUBMIT-ACTIVITY] _submitActivity called');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🟡 [SUBMIT-ACTIVITY] Parameters:', {
      confirmedLinkedCount: confirmedLinked.length,
      editingActivityId,
      activityName,
    });
    
    if (!activityName.trim()) {
      Alert.alert('Error', 'Please enter activity name');
      return;
    }

    if (!selectedFloorLevel) {
      Alert.alert('Error', 'Please select a floor level');
      return;
    }

    // Parse start date carefully to avoid timezone issues
    const [startYear, startMonth, startDay] = startActivityDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    start.setHours(0, 0, 0, 0);

    const durationDays = parseInt(activityDuration) || 1;
    if (durationDays < 1) {
      Alert.alert('Error', 'Duration must be at least 1 day');
      return;
    }

    const end = new Date(start);
    end.setDate(end.getDate() + durationDays - 1);
    end.setHours(0, 0, 0, 0);

    if (end > new Date(timechart.endDate)) {
      Alert.alert('Error', 'Activity end date exceeds project end date');
      return;
    }

    const selectedContractors = selectedSubcontractorIds
      .map(id => timechart.subcontractors.find(s => s.id === id))
      .filter(Boolean) as typeof timechart.subcontractors;

    const floorLevel = (timechart.floorLevels || []).find(f => f.id === selectedFloorLevel);

    if (!floorLevel) {
      Alert.alert('Error', 'Invalid floor level');
      return;
    }

    // Primary contractor is the first selected (or empty for Unassigned)
    const primaryContractor = selectedContractors[0];

    const genId = () => Math.random().toString(36).substr(2, 9);
    const parentId = genId();

    // Build each linked activity object FIRST so we know exactly which ones
    // succeeded (floor-level lookup can theoretically fail). Then set
    // childActivityIds on the parent to match only the built objects.
    const linkedActivityObjs: any[] = [];
    const projectEnd = new Date(timechart.endDate);
    projectEnd.setHours(0, 0, 0, 0);

    console.log('🔵 [Add] confirmedLinked array:', confirmedLinked.map(l => ({ 
      name: l.name, 
      floorLevelId: l.floorLevelId,
      offsetDays: l.offsetDays,
      duration: l.duration 
    })));
    console.log('🔵 [Add] Available floor levels:', (timechart.floorLevels || []).map(f => ({ id: f.id, name: f.name })));

    confirmedLinked.forEach((linked) => {
      const linkedFloor = (timechart.floorLevels || []).find(f => f.id === linked.floorLevelId);
      console.log('🔵 [Add] Looking for floor level:', linked.floorLevelId, '- Found:', linkedFloor ? linkedFloor.name : 'NOT FOUND');
      if (!linkedFloor) {
        // Floor level was deleted between when the form was filled and now — skip with a warning.
        console.log('🔴 [Add] Floor level not found! Linked activity will be skipped:', linked.name);
        Alert.alert('Warning', `Could not find floor level for linked activity "${linked.name}". It will be skipped.`);
        return;
      }

      // linkedStart = parent end date + offsetDays
      const linkedStart = new Date(end);
      linkedStart.setDate(linkedStart.getDate() + linked.offsetDays);
      linkedStart.setHours(0, 0, 0, 0);

      // Clamp linkedStart to project bounds
      const projectStart = new Date(timechart.startDate);
      projectStart.setHours(0, 0, 0, 0);
      if (linkedStart < projectStart) {
        linkedStart.setTime(projectStart.getTime());
      }
      if (linkedStart > projectEnd) {
        Alert.alert(
          'Warning',
          `Linked activity "${linked.name}" starts after the project end date and will not be visible on the chart. Please adjust its offset or the parent activity's dates.`
        );
        // Still add it so it exists in the data — user can edit later
        linkedStart.setTime(projectEnd.getTime());
      }

      const linkedEnd = new Date(linkedStart);
      linkedEnd.setDate(linkedEnd.getDate() + linked.duration - 1);
      linkedEnd.setHours(0, 0, 0, 0);

      // Clamp linkedEnd to project end
      if (linkedEnd > projectEnd) {
        linkedEnd.setTime(projectEnd.getTime());
      }

      const linkedContractors = linked.subcontractorIds
        .map(id => timechart.subcontractors.find(s => s.id === id))
        .filter(Boolean) as typeof timechart.subcontractors;
      const linkedPrimary = linkedContractors[0];

      const linkedObj = {
        id: genId(), // generate ID per-built-object so no phantom IDs in childActivityIds
        name: linked.name,
        startDate: linkedStart,
        endDate: linkedEnd,
        duration: getDaysBetween(linkedStart, linkedEnd),
        subcontractorId: linkedPrimary?.id || '',
        subcontractorName: linkedPrimary?.name || 'Unassigned',
        subcontractorIds: linkedContractors.map(c => c.id),
        subcontractorNames: linkedContractors.map(c => c.name),
        floorLevelId: linkedFloor.id,
        floorLevelName: linkedFloor.name,
        floorLevelColor: linkedFloor.color,
        parentActivityId: parentId,
        childActivityIds: [],
      };
      linkedActivityObjs.push(linkedObj);
      console.log('🟢 [Add] Pushed linked activity object. Array length now:', linkedActivityObjs.length);
    });

    console.log('🔵 [Add] After forEach, linkedActivityObjs.length:', linkedActivityObjs.length);
    console.log('🔵 [Add] onAddActivities prop exists?', typeof onAddActivities, onAddActivities ? 'YES' : 'NO');

    // Build parent AFTER linked objects so childActivityIds is exact (no phantom IDs)
    const parentActivityObj = {
      id: parentId,
      name: activityName.trim(),
      description: activityDescription.trim() || undefined,
      startDate: start,
      endDate: end,
      duration: getDaysBetween(start, end),
      subcontractorId: primaryContractor?.id || '',
      subcontractorName: primaryContractor?.name || 'Unassigned',
      subcontractorIds: selectedContractors.map(c => c.id),
      subcontractorNames: selectedContractors.map(c => c.name),
      floorLevelId: selectedFloorLevel,
      floorLevelName: floorLevel.name,
      floorLevelColor: floorLevel.color,
      childActivityIds: linkedActivityObjs.map(l => l.id), // only real, built IDs
    };

    // Use batch add when linked activities exist to avoid React batching dropping intermediate state.
    // All activities are inserted in a single setTimechart call in EditorScreen.
    if (linkedActivityObjs.length > 0 && onAddActivities) {
      console.log('🟢 [Add] Calling onAddActivities with:', {
        parentId: parentActivityObj.id,
        parentName: parentActivityObj.name,
        parentChildIds: parentActivityObj.childActivityIds,
        linkedCount: linkedActivityObjs.length,
        linkedDetails: linkedActivityObjs.map(l => ({ id: l.id, name: l.name, parentId: l.parentActivityId })),
      });
      console.log('✅ [SUBMIT-ACTIVITY] Calling onAddActivities with', linkedActivityObjs.length + 1, 'activities');
      onAddActivities([parentActivityObj, ...linkedActivityObjs]);
    } else {
      console.log('🟡 [SUBMIT-ACTIVITY] Calling onAddActivity (no linked activities)');
      console.log('🟡 [SUBMIT-ACTIVITY] Parent activity:', {
        id: parentActivityObj.id,
        name: parentActivityObj.name,
      });
      onAddActivity(parentActivityObj);
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ [SUBMIT-ACTIVITY] Activity submission completed');
    console.log('═══════════════════════════════════════════════════════════════');
    
    setActivityName('');
    setActivityDescription('');
    setStartActivityDate(new Date(timechart.startDate).toISOString().split('T')[0]);
    setActivityDuration('7');
    setSelectedSubcontractorIds([]);
    setSelectedSubcontractor(null);
    setSelectedFloorLevel((timechart.floorLevels && timechart.floorLevels.length > 0) ? timechart.floorLevels[0].id : null);
    setInlineNewContractorName('');
    setLinkedActivities([]);
    setAddingLinkedActivityIndex(null);
    setLinkingSourceActivityId(null);
    setShowAddActivityModal(false);
  };

  const handleEditButtonPress = (activities: Activity[]) => {
    if (user && !canPerformAction(user.role, 'canEdit')) {
      Alert.alert('Permission Denied', 'You do not have permission to edit activities.');
      return;
    }
    if (activities.length === 1) {
      // Single floor — open edit form directly
      handleOpenEditActivity(activities[0]);
    } else {
      // Multiple floors — show floor picker first
      setFloorPickerActivities(activities);
      setShowFloorPickerForEdit(true);
    }
  };

  const handleOpenEditActivity = (activity: Activity) => {
    if (user && !canPerformAction(user.role, 'canEdit')) {
      Alert.alert('Permission Denied', 'You do not have permission to edit activities.');
      return;
    }
    // Pre-fill form fields with existing activity data
    console.log('🟡 [EDIT] handleOpenEditActivity called for activity:', {
      id: activity.id,
      name: activity.name,
      parentActivityId: activity.parentActivityId,
    });
    setEditingActivityId(activity.id);
    setActivityName(activity.name);
    setActivityDescription(activity.description || '');
    setStartActivityDate(
      new Date(activity.startDate).toISOString().split('T')[0]
    );
    setActivityDuration(String(getDaysBetween(activity.startDate, activity.endDate)));
    // Seed multi-select from existing data — prefer the array, fall back to single field
    const existingIds = activity.subcontractorIds && activity.subcontractorIds.length > 0
      ? activity.subcontractorIds
      : (activity.subcontractorId ? [activity.subcontractorId] : []);
    setSelectedSubcontractorIds(existingIds);
    setSelectedSubcontractor(existingIds[0] || null);
    setSelectedFloorLevel(activity.floorLevelId || null);
    setLinkedActivities([]); // Linked activities are not shown/edited in edit mode
    setAddingLinkedActivityIndex(null);
    setInlineNewContractorName('');
    console.log('🟡 [EDIT] Setting linkingSourceActivityId to:', activity.id);
    setLinkingSourceActivityId(activity.id); // Set source for linking
    setShowAddActivityModal(true);
  };

  const handleSaveEditActivity = () => {
    if (!activityName.trim()) {
      Alert.alert('Error', 'Please enter activity name');
      return;
    }
    if (!selectedFloorLevel) {
      Alert.alert('Error', 'Please select a floor level');
      return;
    }

    const [startYear, startMonth, startDay] = startActivityDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    start.setHours(0, 0, 0, 0);

    const durationDays = parseInt(activityDuration) || 1;
    if (durationDays < 1) {
      Alert.alert('Error', 'Duration must be at least 1 day');
      return;
    }

    const end = new Date(start);
    end.setDate(end.getDate() + durationDays - 1);
    end.setHours(0, 0, 0, 0);

    if (end > new Date(timechart.endDate)) {
      Alert.alert('Error', 'Activity end date exceeds project end date');
      return;
    }

    const selectedContractors = selectedSubcontractorIds
      .map(id => timechart.subcontractors.find(s => s.id === id))
      .filter(Boolean) as typeof timechart.subcontractors;
    const floorLevel = (timechart.floorLevels || []).find(f => f.id === selectedFloorLevel);

    if (!floorLevel) {
      Alert.alert('Error', 'Invalid floor level');
      return;
    }

    const primaryContractor = selectedContractors[0];

    onUpdateActivity(editingActivityId!, {
      name: activityName.trim(),
      description: activityDescription.trim() || undefined,
      startDate: start,
      endDate: end,
      duration: getDaysBetween(start, end),
      subcontractorId: primaryContractor?.id || '',
      subcontractorName: primaryContractor?.name || 'Unassigned',
      subcontractorIds: selectedContractors.map(c => c.id),
      subcontractorNames: selectedContractors.map(c => c.name),
      floorLevelId: selectedFloorLevel,
      floorLevelName: floorLevel.name,
      floorLevelColor: floorLevel.color,
    });

    // Reset form
    setEditingActivityId(null);
    setActivityName('');
    setActivityDescription('');
    setStartActivityDate(new Date(timechart.startDate).toISOString().split('T')[0]);
    setActivityDuration('7');
    setSelectedSubcontractorIds([]);
    setSelectedSubcontractor(null);
    setSelectedFloorLevel((timechart.floorLevels && timechart.floorLevels.length > 0) ? timechart.floorLevels[0].id : null);
    setInlineNewContractorName('');
    setLinkingSourceActivityId(null);
    setShowAddActivityModal(false);
  };

  const handleLinkActivities = () => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('� [LINK-HANDLER-START] handleLinkActivities called');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔵 [LINK-HANDLER] Current state:', {
      linkingSourceActivityId,
      selectedLinkTargetActivityId,
      linkOffsetDays,
      linkUseCustomOffset,
      linkCustomOffset,
      editingActivityId,
    });

    if (!linkingSourceActivityId) {
      console.log('🔴 [LINK-HANDLER] ❌ No source activity ID');
      Alert.alert('Error', 'Source activity not found');
      return;
    }

    if (!selectedLinkTargetActivityId) {
      console.log('🔴 [LINK-HANDLER] ❌ No target activity selected');
      Alert.alert('Error', 'Please select a target activity to link to');
      return;
    }

    if (linkingSourceActivityId === selectedLinkTargetActivityId) {
      console.log('🔴 [LINK-HANDLER] ❌ Attempting to link activity to itself');
      Alert.alert('Error', 'Cannot link an activity to itself');
      return;
    }

    const sourceActivity = timechart.activities.find(a => a.id === linkingSourceActivityId);
    const targetActivity = timechart.activities.find(a => a.id === selectedLinkTargetActivityId);

    console.log('🔵 [LINK-HANDLER] Activity lookup:', {
      sourceId: linkingSourceActivityId,
      sourceFound: !!sourceActivity,
      sourceName: sourceActivity?.name,
      sourceParentId: sourceActivity?.parentActivityId,
      targetId: selectedLinkTargetActivityId,
      targetFound: !!targetActivity,
      targetName: targetActivity?.name,
      targetParentId: targetActivity?.parentActivityId,
    });

    if (!sourceActivity) {
      console.log('🔴 [LINK-HANDLER] ❌ Source activity not found in timechart');
      Alert.alert('Error', 'Source activity not found');
      return;
    }

    if (!targetActivity) {
      console.log('🔴 [LINK-HANDLER] ❌ Target activity not found in timechart');
      Alert.alert('Error', 'Target activity not found');
      return;
    }

    console.log('✅ [LINK-HANDLER] Both activities found, proceeding with linking...');

    const offsetVal = linkUseCustomOffset ? (parseInt(linkCustomOffset) || 0) : linkOffsetDays;
    console.log('🔵 [LINK-HANDLER] Offset value:', offsetVal);

    // If we're in edit mode (editingActivityId is set), use the form values for source duration
    // Otherwise, use the saved activity duration
    let sourceDurationDays = getDaysBetween(sourceActivity.startDate, sourceActivity.endDate);
    if (editingActivityId === linkingSourceActivityId) {
      // Use form values for calculating duration
      const [startYear, startMonth, startDay] = startActivityDate.split('-').map(Number);
      const formStart = new Date(startYear, startMonth - 1, startDay);
      formStart.setHours(0, 0, 0, 0);
      const durationDays = parseInt(activityDuration) || 1;
      sourceDurationDays = durationDays;
      console.log('� [LINK-HANDLER] In edit mode - using form duration:', {
        formStart: formStart.toISOString(),
        duration: sourceDurationDays,
      });
    } else {
      console.log('🟡 [LINK-HANDLER] Not in edit mode - using saved duration:', sourceDurationDays);
    }

    // Calculate new dates for the source activity based on offset from target's end date
    const targetEndDate = new Date(targetActivity.endDate);
    targetEndDate.setHours(0, 0, 0, 0);
    
    // Linked activity starts at: target end date + offset days
    const newSourceStartDate = new Date(targetEndDate);
    newSourceStartDate.setDate(newSourceStartDate.getDate() + offsetVal);
    newSourceStartDate.setHours(0, 0, 0, 0);
    
    // Calculate end date based on duration
    const newSourceEndDate = new Date(newSourceStartDate);
    newSourceEndDate.setDate(newSourceEndDate.getDate() + sourceDurationDays - 1);
    newSourceEndDate.setHours(0, 0, 0, 0);

    console.log('� [LINK-HANDLER] Calculated new dates:', {
      targetEndDate: targetEndDate.toISOString(),
      offsetVal,
      sourceDuration: sourceDurationDays,
      newSourceStartDate: newSourceStartDate.toISOString(),
      newSourceEndDate: newSourceEndDate.toISOString(),
    });

    // Update the source activity to have the target as parent AND new dates based on offset
    // IMPORTANT: Include startDate and endDate to prevent "Invalid Date" errors in parent handler
    const sourceUpdates: any = {
      parentActivityId: targetActivity.id,
      startDate: newSourceStartDate,
      endDate: newSourceEndDate,
      duration: sourceDurationDays,
    };

    // Update the target activity to include source in childActivityIds
    const updatedChildIds = targetActivity.childActivityIds ? [...targetActivity.childActivityIds] : [];
    if (!updatedChildIds.includes(sourceActivity.id)) {
      updatedChildIds.push(sourceActivity.id);
    }

    console.log('🟢 [LINK-HANDLER] Prepared updates:', {
      sourceActivityId: linkingSourceActivityId,
      sourceUpdates,
      targetActivityId: selectedLinkTargetActivityId,
      targetChildIds: updatedChildIds,
    });

    try {
      // CRITICAL FIX: Use batch update to apply BOTH updates in a single state change
      // This prevents the second update from overwriting the first
      if (onBatchUpdateActivities) {
        console.log('🟢 [LINK-HANDLER] ➡️ Using batch update for SOURCE and TARGET activities...');
        onBatchUpdateActivities([
          {
            id: linkingSourceActivityId,
            changes: sourceUpdates,
          },
          {
            id: selectedLinkTargetActivityId,
            changes: {
              childActivityIds: updatedChildIds,
              startDate: targetActivity.startDate,
              endDate: targetActivity.endDate,
            },
          },
        ]);
        console.log('✅ [LINK-HANDLER] Batch update completed for SOURCE and TARGET activities');
      } else {
        // Fallback to separate updates if batch not available
        console.log('🟡 [LINK-HANDLER] Batch update not available, using separate updates...');
        onUpdateActivity(linkingSourceActivityId, sourceUpdates);
        console.log('✅ [LINK-HANDLER] Source activity update callback completed');
        onUpdateActivity(selectedLinkTargetActivityId, {
          childActivityIds: updatedChildIds,
          startDate: targetActivity.startDate,
          endDate: targetActivity.endDate,
        });
        console.log('✅ [LINK-HANDLER] Target activity update callback completed');
      }

      console.log('✅ [LINK-HANDLER] Both updates called successfully');
    } catch (error) {
      console.log('🔴 [LINK-HANDLER] Error during update:', error);
      Alert.alert('Error', 'Failed to link activities');
      return;
    }

    // Reset linking state
    console.log('� [LINK-HANDLER] Resetting linking state...');
    setShowLinkActivityModal(false);
    setLinkingSourceActivityId(null);
    setSelectedLinkTargetActivityId(null);
    setLinkOffsetDays(0);
    setLinkUseCustomOffset(false);
    setLinkCustomOffset('');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ [LINK-HANDLER-COMPLETE] Linking process finished successfully');
    console.log('═══════════════════════════════════════════════════════════════');
    Alert.alert('Success', 'Activities linked successfully!');
  };

  const handleAddContractor = () => {
    if (!contractorName.trim()) {
      Alert.alert('Error', 'Please enter contractor name');
      return;
    }
    if (editingContractorId) {
      // Save rename
      onUpdateSubcontractor(editingContractorId, contractorName.trim());
      setEditingContractorId(null);
    } else {
      onAddSubcontractor(contractorName.trim());
    }
    setContractorName('');
    // Do NOT close the modal — let the user keep working
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
    
    // Check for children in TWO ways:
    // 1. childActivityIds array (if maintained)
    // 2. parentActivityId references (more reliable)
    const childActivityIds = activity?.childActivityIds || [];
    const childrenByParentId = timechart.activities.filter(a => a.parentActivityId === draggingActivityId).map(a => a.id);
    
    // Use whichever has content, prefer parentActivityId method as it's more reliable
    const directChildIds = childrenByParentId.length > 0 ? childrenByParentId : childActivityIds;
    
    console.log('🔵 [Drag] Activity press out:', {
      activityId: draggingActivityId,
      childActivityIds: childActivityIds,
      childrenByParentId: childrenByParentId,
      usingDirectChildIds: directChildIds,
    });
    
    // Helper function to recursively find all descendants (children, grandchildren, etc.)
    const findAllDescendants = (parentIds: string[]): string[] => {
      const descendants: string[] = [];
      const toProcess = [...parentIds];
      
      while (toProcess.length > 0) {
        const currentId = toProcess.shift();
        if (!currentId) continue;
        
        // Find all activities that have this as their parent
        const children = timechart.activities.filter(a => a.parentActivityId === currentId);
        children.forEach(child => {
          if (!descendants.includes(child.id)) {
            descendants.push(child.id);
            toProcess.push(child.id); // Add to queue for further processing
          }
        });
      }
      
      return descendants;
    };
    
    // Calculate the offset (days moved) BEFORE updating parent
    // Use getSignedDaysBetween to handle both forward and backward movement correctly
    let offset = 0;
    if (activity && directChildIds.length > 0) {
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
    if (directChildIds.length > 0) {
      // directChildIds are the immediate children we found
      // Now find their descendants (grandchildren, great-grandchildren, etc.)
      const descendantsOfChildren = findAllDescendants(directChildIds);
      
      // Combine direct children + all their descendants
      const allDescendantIds = [...directChildIds, ...descendantsOfChildren];
      
      console.log('🔵 [Drag] Child discovery:', {
        directChildIds: directChildIds,
        descendantsOfChildren: descendantsOfChildren,
        allDescendantIds: allDescendantIds,
      });
      
      // This is a parent with children - update all together
      const childUpdatesData = allDescendantIds.map((childId) => {
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

      console.log('🔵 [Drag] Updating', allDescendantIds.length, 'descendants with offset', offset, '- descendantIds:', allDescendantIds);

      // Call a special update method that handles parent + children together
      onUpdateActivity(draggingActivityId, {
        startDate: dragActivity.startDate,
        endDate: dragActivity.endDate,
        duration: getDaysBetween(dragActivity.startDate, dragActivity.endDate),
        childUpdates: childUpdatesData, // Pass child updates as part of parent update
      });
    } else {
      // Regular activity without children - update normally
      console.log('🔵 [Drag] No children found, updating parent only');
      onUpdateActivity(draggingActivityId, {
        startDate: dragActivity.startDate,
        endDate: dragActivity.endDate,
        duration: getDaysBetween(dragActivity.startDate, dragActivity.endDate),
      });
    }

    setDraggingActivityId(null);
    setDragActivity(null);
  };

  // ─── Segment-level drag handlers ───────────────────────────────────────────
  // These allow dragging one individual floor segment within a grouped block
  // independently of the other segments.
  // IMPORTANT: All reads inside move/release use refs (not state) to avoid the
  // stale-closure problem that arises from useMemo capturing the handlers once.

  const handleSegmentPressIn = (activity: Activity, event: GestureResponderEvent) => {
    if (user && !canPerformAction(user.role, 'canEditActivity')) {
      Alert.alert('Permission Denied', 'You do not have permission to edit timechart activities. Your role is view-only.');
      return;
    }
    // Write to refs first (sync), then setState for re-render
    draggingSegmentIdRef.current = activity.id;
    segmentDragStartXRef.current = event.nativeEvent.pageX;
    segmentDragActivityRef.current = activity;

    setDraggingSegmentId(activity.id);
    setSegmentDragStartX(event.nativeEvent.pageX);
    setSegmentDragActivity(activity);
  };

  const handleSegmentPressMove = (event: GestureResponderEvent) => {
    // Read from refs — always fresh, never stale
    if (!draggingSegmentIdRef.current || !segmentDragActivityRef.current) return;

    const currentX = event.nativeEvent.pageX;
    const deltaX = currentX - segmentDragStartXRef.current;
    const daysDelta = Math.round(deltaX / DAY_WIDTH);

    if (daysDelta === 0) return;

    const current = segmentDragActivityRef.current;
    const newStartDate = new Date(current.startDate);
    newStartDate.setDate(newStartDate.getDate() + daysDelta);

    const newEndDate = new Date(current.endDate);
    newEndDate.setDate(newEndDate.getDate() + daysDelta);

    if (newStartDate < timechart.startDate || newEndDate > timechart.endDate) {
      return; // Silently clamp — no Alert mid-drag
    }

    const updated: Activity = { ...current, startDate: newStartDate, endDate: newEndDate };

    // Update ref immediately (sync) so next move event sees the new position
    segmentDragActivityRef.current = updated;
    segmentDragStartXRef.current = currentX;

    // Update state to trigger a re-render for visual feedback
    setSegmentDragActivity(updated);
    setSegmentDragStartX(currentX);
  };

  const handleSegmentPressOut = () => {
    // Read from refs — always fresh
    const segId = draggingSegmentIdRef.current;
    const segActivity = segmentDragActivityRef.current;

    if (!segId || !segActivity) {
      draggingSegmentIdRef.current = null;
      segmentDragActivityRef.current = null;
      setDraggingSegmentId(null);
      setSegmentDragActivity(null);
      return;
    }

    onUpdateActivity(segId, {
      startDate: segActivity.startDate,
      endDate: segActivity.endDate,
      duration: getDaysBetween(segActivity.startDate, segActivity.endDate),
    });

    // Clear refs and state
    draggingSegmentIdRef.current = null;
    segmentDragActivityRef.current = null;
    segmentDragStartXRef.current = 0;
    setDraggingSegmentId(null);
    setSegmentDragActivity(null);
    setSegmentDragStartX(0);
  };
  // ────────────────────────────────────────────────────────────────────────────

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

    // Convert to array and sort by the first activity's original id (insertion order) — NOT by startDate,
    // so that dragging an activity to an earlier date never re-orders the rows.
    return Array.from(groupedMap.values())
      .map(group => {
        // Capture the first-inserted ID BEFORE sorting the group by floorLevelId,
        // so the stable sort key always refers to the original insertion order.
        const firstId = group[0].id;
        return {
          activities: group.sort((a, b) => (a.floorLevelId || '').localeCompare(b.floorLevelId || '')),
          groupKey: (group[0].subcontractorId || '') + (group[0].name || ''),
          firstId,
        };
      })
      .sort((a, b) => {
        // Sort by the index of the first activity in the original timechart.activities array
        const aIndex = timechart.activities.findIndex(act => act.id === a.firstId);
        const bIndex = timechart.activities.findIndex(act => act.id === b.firstId);
        return aIndex - bIndex;
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

    // For grouped blocks: build per-activity display info (segment may be independently dragged)
    const activityDisplayMap = new Map<string, { startDay: number; endDay: number; activity: Activity }>();
    if (isGrouped) {
      activitiesArray.forEach(act => {
        const displayAct = (draggingSegmentId === act.id && segmentDragActivity) ? segmentDragActivity : act;
        const s = getDaysBetween(timechart.startDate, displayAct.startDate);
        const e = s + getDaysBetween(displayAct.startDate, displayAct.endDate) + 1;
        activityDisplayMap.set(act.id, { startDay: s, endDay: e, activity: displayAct });
      });
    }

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(timechart.startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const isHoliday = isNonWorkingDay(currentDate, timechart.nonWorkingDays || timechart.publicHolidays || []);
      const isWeekend = currentDate.getDay() === 0; // Only Sunday is weekend

      // For grouped blocks: a cell is "activity" for any segment that covers day i
      let isActivityDay: boolean;
      if (isGrouped) {
        isActivityDay = activitiesArray.some(act => {
          const info = activityDisplayMap.get(act.id)!;
          return i >= info.startDay && i < info.endDay;
        });
      } else {
        isActivityDay = i >= displayStartDay && i < endDay;
      }

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
            onStartShouldSetResponder={() => !isGrouped}
            onMoveShouldSetResponder={() => !isGrouped && draggingActivityId === primaryActivity.id}
            onResponderGrant={(event) => !isGrouped && handleActivityPressIn(primaryActivity, event)}
            onResponderMove={handleActivityPressMove}
            onResponderRelease={handleActivityPressOut}
          >
            {shouldShowActivity && (
              <>
                {isGrouped ? (
                  // Grouped cell: tile subdivisions OR number count based on view mode
                  groupedCellView === 'tiles' ? (
                    (() => {
                      // Only consider segments that are actually active (covering day i)
                      const activeSegments = activitiesArray.filter(act => {
                        const info = activityDisplayMap.get(act.id)!;
                        return i >= info.startDay && i < info.endDay;
                      });

                      if (activeSegments.length === 1) {
                        // Exactly one segment covers this column — render a plain solid bar
                        const act = activeSegments[0];
                        const isBeingSegmentDragged = draggingSegmentId === act.id;
                        const isFilteredOut = activeFloorFilter !== null && act.floorLevelId !== activeFloorFilter;
                        return (
                          <View
                            style={[
                              styles.activityIndicator,
                              {
                                backgroundColor: act.floorLevelColor,
                                opacity: isFilteredOut ? 0.12 : (isBeingSegmentDragged ? 0.65 : 1),
                              },
                              act.isCompleted && styles.completedActivityIndicator,
                              isBeingSegmentDragged && styles.subdividedActivityIndicatorDragging,
                            ]}
                            onStartShouldSetResponder={() => true}
                            onMoveShouldSetResponder={() => draggingSegmentId === act.id}
                            onResponderGrant={(event) => handleSegmentPressIn(act, event)}
                            onResponderMove={handleSegmentPressMove}
                            onResponderRelease={handleSegmentPressOut}
                          />
                        );
                      }

                      // Multiple segments active on this column — render subdivided tiles
                      return (
                        <View style={[styles.subdivisionContainer, { height: '70%', width: '90%' }]}>
                          {activeSegments.map((activity, idx) => {
                            const isBeingSegmentDragged = draggingSegmentId === activity.id;
                            const isFilteredOut = activeFloorFilter !== null && activity.floorLevelId !== activeFloorFilter;
                            return (
                              <View
                                key={`subdivision-${activity.id}`}
                                style={[
                                  styles.subdividedActivityIndicator,
                                  {
                                    backgroundColor: activity.floorLevelColor,
                                    flex: 1,
                                    opacity: isFilteredOut ? 0.12 : (isBeingSegmentDragged ? 0.65 : 1),
                                  },
                                  idx < activeSegments.length - 1 && styles.subdividedActivityIndicatorBorder,
                                  activity.isCompleted && styles.completedActivityIndicator,
                                  isBeingSegmentDragged && styles.subdividedActivityIndicatorDragging,
                                ]}
                                onStartShouldSetResponder={() => true}
                                onMoveShouldSetResponder={() => draggingSegmentId === activity.id}
                                onResponderGrant={(event) => handleSegmentPressIn(activity, event)}
                                onResponderMove={handleSegmentPressMove}
                                onResponderRelease={handleSegmentPressOut}
                              />
                            );
                          })}
                        </View>
                      );
                    })()
                  ) : (
                    // Number view: show count badge
                    (() => {
                      const visibleCount = activeFloorFilter
                        ? activitiesArray.filter(a => {
                            const info = activityDisplayMap.get(a.id)!;
                            return a.floorLevelId === activeFloorFilter && i >= info.startDay && i < info.endDay;
                          }).length
                        : activitiesArray.filter(a => {
                            const info = activityDisplayMap.get(a.id)!;
                            return i >= info.startDay && i < info.endDay;
                          }).length;
                      const badgeColor = activeFloorFilter
                        ? (activitiesArray.find(a => a.floorLevelId === activeFloorFilter)?.floorLevelColor ?? primaryActivity.floorLevelColor)
                        : primaryActivity.floorLevelColor;
                      return (
                        <View style={[styles.groupCountBadge, { backgroundColor: badgeColor, opacity: visibleCount === 0 ? 0.12 : 1 }]}>
                          <Text style={styles.groupCountText}>{visibleCount > 0 ? visibleCount : activitiesArray.length}</Text>
                        </View>
                      );
                    })()
                  )
                ) : (
                  // Single activity indicator
                  <View
                    style={[
                      styles.activityIndicator,
                      { 
                        backgroundColor: displayPrimaryActivity.floorLevelColor,
                        opacity: (activeFloorFilter !== null && displayPrimaryActivity.floorLevelId !== activeFloorFilter)
                          ? 0.12
                          : (draggingActivityId === primaryActivity.id ? 0.7 : 1),
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
      // Build the contractor display name — show all assigned contractors
      const resolvedContractorNames = (primaryActivity.subcontractorIds && primaryActivity.subcontractorIds.length > 0
        ? primaryActivity.subcontractorIds
            .map(id => timechart.subcontractors.find(c => c.id === id)?.name)
            .filter(Boolean)
        : primaryActivity.subcontractorId
          ? [timechart.subcontractors.find(c => c.id === primaryActivity.subcontractorId)?.name].filter(Boolean)
          : []
      ) as string[];
      const contractorName = resolvedContractorNames.length > 0
        ? resolvedContractorNames.join(', ')
        : 'Unassigned';

      // Get linked activities for this primary activity group.
      // Check ALL activities in the group (not just primaryActivity) since the floor-level
      // sort inside groupActivitiesByNameAndContractor may put the real parent at index > 0.
      const groupActivityIds = new Set(activities.map(a => a.id));
      
      // Helper function to recursively find all descendants (children, grandchildren, etc.)
      const findAllDescendants = (parentIds: Set<string>): Set<string> => {
        const descendants = new Set<string>();
        const toProcess = Array.from(parentIds);
        
        while (toProcess.length > 0) {
          const currentId = toProcess.pop();
          if (!currentId) continue;
          
          // Find all activities that have this as their parent
          const children = timechart.activities.filter(a => a.parentActivityId === currentId);
          children.forEach(child => {
            if (!descendants.has(child.id)) {
              descendants.add(child.id);
              toProcess.push(child.id); // Add to queue for further processing
            }
          });
        }
        
        return descendants;
      };
      
      const allDescendantIds = findAllDescendants(groupActivityIds);
      const linkedActivityRows = timechart.activities.filter(a =>
        // Include if this activity is a descendant of the group
        allDescendantIds.has(a.id)
      );

      if (linkedActivityRows.length > 0) {
        console.log('🟣 [Render] Found', linkedActivityRows.length, 'linked activities for group:', {
          groupKey: group.groupKey,
          parentIds: Array.from(groupActivityIds),
          linkedActivities: linkedActivityRows.map(l => ({ id: l.id, name: l.name, parentId: l.parentActivityId })),
        });
        // DEBUG: Log the full object to see what fields are present
        linkedActivityRows.forEach(l => {
          console.log('🔵 [Render] Full linked activity object:', {
            id: l.id,
            name: l.name,
            parentActivityId: l.parentActivityId,
            allKeys: Object.keys(l),
          });
        });
      }

      // For grouped rows: row is "active" if ANY activity matches the floor filter
      const rowMatchesFilter = activeFloorFilter === null ||
        activities.some(a => a.floorLevelId === activeFloorFilter);
      const rowOpacity = rowMatchesFilter ? 1 : 0.25;

      return (
        <View key={`activity-group-${group.groupKey}`}>
          {/* Parent Activity Row (Grouped if multiple floors) — wrapped separately so children can have independent opacity */}
          <View style={{ opacity: rowOpacity }}>
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
                      const allCompleted = activities.every(act => act.isCompleted);
                      const targetCompleted = !allCompleted;
                      if (onBatchUpdateActivities) {
                        onBatchUpdateActivities(activities.map(act => ({ id: act.id, changes: { isCompleted: targetCompleted } })));
                      } else {
                        activities.forEach(act => onUpdateActivity(act.id, { isCompleted: targetCompleted }));
                      }
                    }}
                  >
                    <Text style={[styles.completeActivityText, activities.every(act => act.isCompleted) && styles.completeActivityTextActive]}>
                      ✓
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      if (user && !canPerformAction(user.role, 'canMarkActivityStarted')) {
                        Alert.alert('Permission Denied', 'You do not have permission to mark activities as started.');
                        return;
                      }
                      const allStarted = activities.every(act => act.isStarted);
                      const targetStarted = !allStarted;
                      if (onBatchUpdateActivities) {
                        onBatchUpdateActivities(activities.map(act => ({ id: act.id, changes: { isStarted: targetStarted } })));
                      } else {
                        activities.forEach(act => onUpdateActivity(act.id, { isStarted: targetStarted }));
                      }
                    }}
                    style={[styles.startedButton, activities.every(act => act.isStarted) && styles.startedButtonActive]}
                  >
                    <Text style={[styles.startedButtonText, activities.every(act => act.isStarted) && styles.startedButtonTextActive]}>
                      {activities.every(act => act.isStarted) ? 'Started' : 'Start'}
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
                  <TouchableOpacity
                    onPress={() => handleEditButtonPress(activities)}
                  >
                    <Text style={styles.editActivityText}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      // Open link modal for the first (primary) activity in the group
                      console.log('═══════════════════════════════════════════════════════════════');
                      console.log('🔗 [LINK-BUTTON] Link button clicked in activity row');
                      console.log('═══════════════════════════════════════════════════════════════');
                      console.log('🔗 [LINK-BUTTON] Activity details:', {
                        primaryActivityId: primaryActivity.id,
                        primaryActivityName: primaryActivity.name,
                        primaryActivityParentId: primaryActivity.parentActivityId,
                        editingActivityId,
                      });
                      setLinkingSourceActivityId(primaryActivity.id);
                      setSelectedLinkTargetActivityId(null);
                      setLinkOffsetDays(0);
                      setLinkUseCustomOffset(false);
                      setLinkCustomOffset('');
                      console.log('� [LINK-BUTTON] State set, opening modal...');
                      setShowLinkActivityModal(true);
                      console.log('═══════════════════════════════════════════════════════════════');
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    <Text style={[styles.editActivityText, { color: '#FF9800' }]}>🔗</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.chartArea}>
                {renderDateCells(activities, activityStartDay)}
              </View>
            </View>
          </View>

          {/* Linked Activity Rows — appear directly below the parent (OUTSIDE parent opacity wrapper) */}
            {linkedActivityRows.map((linkedActivity) => {
              const linkedStartDay = getDaysBetween(timechart.startDate, linkedActivity.startDate);
              console.log('🎨 [RenderChild] Rendering child activity:', {
                childId: linkedActivity.id,
                childName: linkedActivity.name,
                startDate: linkedActivity.startDate,
                linkedStartDay: linkedStartDay,
                timechartStartDate: timechart.startDate,
                parentActivityId: linkedActivity.parentActivityId,
              });
              const linkedContractorNames = (linkedActivity.subcontractorIds && linkedActivity.subcontractorIds.length > 0
                ? linkedActivity.subcontractorIds.map(id => timechart.subcontractors.find(c => c.id === id)?.name).filter(Boolean)
                : linkedActivity.subcontractorId
                  ? [timechart.subcontractors.find(c => c.id === linkedActivity.subcontractorId)?.name].filter(Boolean)
                  : []
              ) as string[];
              const linkedContractorName = linkedContractorNames.length > 0
                ? linkedContractorNames.join(', ')
                : 'Unassigned';
              
              // Check if child activity matches the active floor filter
              const childMatchesFilter = activeFloorFilter === null || linkedActivity.floorLevelId === activeFloorFilter;
              const childOpacity = childMatchesFilter ? 1 : 0.25;
              
              return (
                <View key={`linked-${linkedActivity.id}`} style={[styles.activityRowContainer, styles.linkedActivityRow, { opacity: childOpacity }]}>
                  <View style={[styles.cell, styles.activityCell, { width: ACTIVITY_LABEL_WIDTH }]}>
                    <Text
                      style={[
                        styles.activityCellText,
                        styles.linkedActivityCellText,
                        linkedActivity.isCompleted && styles.completedActivityCellText
                      ]}
                      numberOfLines={2}
                    >
                      ↳ {linkedActivity.name}
                    </Text>
                  </View>

                  <View style={[styles.cell, styles.contractorCell, { width: CONTRACTOR_LABEL_WIDTH }]}>
                    <View style={styles.contractorNameRow}>
                      <View
                        style={[
                          styles.contractorColorDot,
                          { backgroundColor: linkedActivity.floorLevelColor, opacity: 0.75 },
                        ]}
                      />
                      <Text style={styles.contractorCellText} numberOfLines={1}>
                        {linkedContractorName}
                      </Text>
                    </View>
                    <View style={styles.contractorActionsRow}>
                      <TouchableOpacity
                        onPress={() => {
                          if (user && !canPerformAction(user.role, 'canMarkActivityComplete')) {
                            Alert.alert('Permission Denied', 'You do not have permission to mark activities as complete.');
                            return;
                          }
                          handleToggleActivityCompletion(linkedActivity.id);
                        }}
                      >
                        <Text style={[styles.completeActivityText, linkedActivity.isCompleted && styles.completeActivityTextActive]}>
                          ✓
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          if (user && !canPerformAction(user.role, 'canMarkActivityStarted')) {
                            Alert.alert('Permission Denied', 'You do not have permission to mark activities as started.');
                            return;
                          }
                          handleToggleActivityStarted(linkedActivity.id);
                        }}
                        style={[styles.startedButton, linkedActivity.isStarted && styles.startedButtonActive]}
                      >
                        <Text style={[styles.startedButtonText, linkedActivity.isStarted && styles.startedButtonTextActive]}>
                          {linkedActivity.isStarted ? 'Started' : 'Start'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          if (user && !canPerformAction(user.role, 'canDeleteActivity')) {
                            Alert.alert('Permission Denied', 'You do not have permission to delete activities.');
                            return;
                          }
                          onRemoveActivity(linkedActivity.id);
                        }}
                      >
                        <Text style={styles.removeActivityText}>✕</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleOpenEditActivity(linkedActivity)}>
                        <Text style={styles.editActivityText}>✎</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.chartArea}>
                    {renderDateCells(linkedActivity, linkedStartDay)}
                  </View>
                </View>
              );
            })}
          </View>
        );
    });
  };

  // Memoize activity rows to ensure they update when timechart changes
  const memoizedActivityRows = useMemo(() => renderActivityRows(), [timechart.activities, timechart.subcontractors, timechart.startDate, timechart.nonWorkingDays, timechart.publicHolidays, timechart.floorLevels, draggingActivityId, dragActivity, groupedCellView, activeFloorFilter, draggingSegmentId, segmentDragActivity]);

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
        {/* Toggle between tile and number view for grouped activities */}
        <TouchableOpacity
          style={styles.viewToggleButton}
          onPress={() => setGroupedCellView(v => v === 'tiles' ? 'numbers' : 'tiles')}
        >
          <Text style={styles.viewToggleButtonText}>
            {groupedCellView === 'tiles' ? '🔢 Count' : '🎨 Tiles'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floor Filter Bar */}
      {timechart.floorLevels && timechart.floorLevels.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.floorFilterBar}
          contentContainerStyle={styles.floorFilterBarContent}
        >
          {/* "All Floors" chip */}
          <TouchableOpacity
            style={[
              styles.floorFilterChip,
              activeFloorFilter === null && styles.floorFilterChipAll,
            ]}
            onPress={() => setActiveFloorFilter(null)}
          >
            <Text style={[
              styles.floorFilterChipText,
              activeFloorFilter === null && styles.floorFilterChipTextActive,
            ]}>
              All Floors
            </Text>
          </TouchableOpacity>

          {timechart.floorLevels.map((floor) => {
            const isActive = activeFloorFilter === floor.id;
            return (
              <TouchableOpacity
                key={floor.id}
                style={[
                  styles.floorFilterChip,
                  isActive && { borderColor: floor.color, backgroundColor: floor.color },
                ]}
                onPress={() => setActiveFloorFilter(isActive ? null : floor.id)}
              >
                <View style={[styles.floorFilterChipDot, { backgroundColor: isActive ? '#FFF' : floor.color }]} />
                <Text style={[
                  styles.floorFilterChipText,
                  isActive && styles.floorFilterChipTextActive,
                ]}>
                  {floor.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

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
                <Text style={styles.emptyText}>No activities added yet. Use the button below to get started.</Text>
              </View>
            )}

            {/* Inline Add Activity button — pinned to the left label columns */}
            {(!user || canPerformAction(user.role, 'canAddActivity')) && (
              <View style={styles.inlineAddActivityRow}>
                <TouchableOpacity
                  style={[styles.inlineAddActivityButton, { width: ACTIVITY_LABEL_WIDTH + CONTRACTOR_LABEL_WIDTH - 16 }]}
                  onPress={() => setShowAddActivityModal(true)}
                >
                  <Text style={styles.inlineAddActivityButtonText}>＋ Add Activity</Text>
                </TouchableOpacity>
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
            <Text style={styles.helpText}>🎨 In grouped blocks, drag an individual coloured segment to move just that floor independently</Text>
          </View>
          <View style={styles.helpTextRow}>
            <Text style={styles.helpText}>📝 Double-tap an activity bar to log daily work notes & photos</Text>
          </View>
        </View>
      </ScrollView>

      {/* Send Mail Notification Button */}
      <View style={styles.mailNotificationBar}>
        <TouchableOpacity
          style={styles.mailNotificationButton}
          onPress={() => {
            Alert.alert('Coming Soon', 'Mail notification functionality will be available in a future update.');
          }}
        >
          <Text style={styles.mailNotificationIcon}>✉️</Text>
          <Text style={styles.mailNotificationText}>Send Mail Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Add / Edit Activity Modal */}
      <Modal
        visible={showAddActivityModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setEditingActivityId(null);
          setInlineNewContractorName('');
          setLinkingSourceActivityId(null);
          setShowAddActivityModal(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                setEditingActivityId(null);
                setInlineNewContractorName('');
                setLinkingSourceActivityId(null);
                setShowAddActivityModal(false);
              }}>
                <Text style={styles.closeButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{editingActivityId ? 'Edit Activity' : 'Add Activity'}</Text>
              <TouchableOpacity onPress={editingActivityId ? handleSaveEditActivity : handleAddActivity}>
                <Text style={styles.doneButton}>{editingActivityId ? 'Save' : 'Done'}</Text>
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
                <Text style={styles.label}>Duration (days) *</Text>
                <View style={styles.durationStepper}>
                  <TouchableOpacity
                    style={styles.durationStepperBtn}
                    onPress={() => setActivityDuration(d => String(Math.max(1, (parseInt(d) || 1) - 1)))}
                  >
                    <Text style={styles.durationStepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.durationStepperInput}
                    value={activityDuration}
                    onChangeText={v => setActivityDuration(v.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    textAlign="center"
                    selectTextOnFocus
                  />
                  <TouchableOpacity
                    style={styles.durationStepperBtn}
                    onPress={() => setActivityDuration(d => String((parseInt(d) || 0) + 1))}
                  >
                    <Text style={styles.durationStepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>
                  {(() => {
                    const d = parseInt(activityDuration) || 0;
                    if (d > 0 && startActivityDate) {
                      const [y, m, day] = startActivityDate.split('-').map(Number);
                      const end = new Date(y, m - 1, day);
                      end.setDate(end.getDate() + d - 1);
                      return `Ends: ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                    }
                    return '';
                  })()}
                </Text>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Assigned Contractors</Text>
                <Text style={styles.helperText}>Select one or more contractors. Leave all unchecked for Unassigned.</Text>
                <View style={styles.pickerContainer}>
                  {/* Existing contractors — multi-select checkboxes */}
                  {timechart.subcontractors.length === 0 ? (
                    <Text style={[styles.noSubcontractorText, { marginBottom: 8 }]}>No contractors yet — add one below.</Text>
                  ) : (
                    timechart.subcontractors.map((contractor) => {
                      const isChecked = selectedSubcontractorIds.includes(contractor.id);
                      return (
                        <TouchableOpacity
                          key={contractor.id}
                          style={styles.multiContractorRow}
                          activeOpacity={0.7}
                          onPress={() => {
                            setSelectedSubcontractorIds(prev =>
                              isChecked
                                ? prev.filter(id => id !== contractor.id)
                                : [...prev, contractor.id]
                            );
                          }}
                        >
                          <View style={[styles.multiContractorCheckbox, isChecked && styles.multiContractorCheckboxChecked]}>
                            {isChecked && <Text style={styles.multiContractorCheckmark}>✓</Text>}
                          </View>
                          <Text style={[styles.contractorOptionText, { color: '#333', flex: 1 }]}>
                            {contractor.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}

                  {/* Selected summary pill */}
                  {selectedSubcontractorIds.length > 0 && (
                    <View style={styles.selectedContractorsSummary}>
                      <Text style={styles.selectedContractorsSummaryText}>
                        ✓ {selectedSubcontractorIds.length === 1
                          ? timechart.subcontractors.find(s => s.id === selectedSubcontractorIds[0])?.name || '1 contractor'
                          : `${selectedSubcontractorIds.length} contractors selected`}
                      </Text>
                      <TouchableOpacity onPress={() => setSelectedSubcontractorIds([])}>
                        <Text style={styles.selectedContractorsClear}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Inline add-new-contractor row */}
                  <View style={styles.inlineAddContractorRow}>
                    <TextInput
                      style={styles.inlineAddContractorInput}
                      placeholder="New contractor name…"
                      placeholderTextColor="#aaa"
                      value={inlineNewContractorName}
                      onChangeText={setInlineNewContractorName}
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        const name = inlineNewContractorName.trim();
                        if (!name) return;
                        onAddSubcontractor(name);
                        setInlineNewContractorName('');
                      }}
                    />
                    <TouchableOpacity
                      style={styles.inlineAddContractorBtn}
                      onPress={() => {
                        const name = inlineNewContractorName.trim();
                        if (!name) {
                          Alert.alert('Error', 'Please enter a contractor name');
                          return;
                        }
                        onAddSubcontractor(name);
                        setInlineNewContractorName('');
                      }}
                    >
                      <Text style={styles.inlineAddContractorBtnText}>＋ Add</Text>
                    </TouchableOpacity>
                  </View>
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

              {/* ── Linked Activities Section ── */}
              {!editingActivityId ? (
                // CREATE MODE: Add inline linked activities
                <View style={styles.formSection}>
                  <Text style={styles.label}>Linked Activities</Text>
                  <Text style={styles.helperText}>
                    Add follow-on activities that are linked to this one. Each linked activity appears directly below in the timechart.
                  </Text>

                  {/* Existing linked activity cards */}
                  {linkedActivities.map((linked, idx) => {
                    const linkedFloor = (timechart.floorLevels || []).find(f => f.id === linked.floorLevelId);
                    const offsetLabel = linked.offsetDays === 0
                      ? 'Same day as parent ends'
                      : linked.offsetDays > 0
                        ? `+${linked.offsetDays} day${linked.offsetDays !== 1 ? 's' : ''} after parent ends`
                        : `${linked.offsetDays} day${linked.offsetDays !== -1 ? 's' : ''} before parent ends`;
                    return (
                      <View key={linked.id} style={styles.linkedActivityCard}>
                        <View style={styles.linkedActivityCardHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.linkedActivityCardName}>{linked.name}</Text>
                            <Text style={styles.linkedActivityCardMeta}>
                              {offsetLabel} · {linked.duration} day{linked.duration !== 1 ? 's' : ''}
                              {linkedFloor ? ` · ${linkedFloor.name}` : ''}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => setLinkedActivities(prev => prev.filter((_, i) => i !== idx))}
                            style={styles.linkedActivityCardRemove}
                          >
                            <Text style={styles.linkedActivityCardRemoveText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                  {/* Inline "Add Linked Activity" form */}
                  {addingLinkedActivityIndex !== null ? (
                    <View style={styles.linkedActivityForm}>
                      <Text style={styles.linkedActivityFormTitle}>New Linked Activity</Text>

                      {/* Name */}
                      <View style={styles.linkedActivityFormRow}>
                        <Text style={styles.linkedActivityFormLabel}>Activity Name *</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g., Inspection, Finishing"
                          placeholderTextColor="#999"
                          value={linkedName}
                          onChangeText={setLinkedName}
                        />
                      </View>

                      {/* Offset selector */}
                      <View style={styles.linkedActivityFormRow}>
                        <Text style={styles.linkedActivityFormLabel}>Starts (relative to parent end) *</Text>
                        <View style={styles.linkedOffsetRow}>
                          {[-2, -1, 0, 1, 2].map(preset => (
                            <TouchableOpacity
                              key={preset}
                              style={[
                                styles.linkedOffsetChip,
                                !linkedUseCustomOffset && linkedOffsetDays === preset && styles.linkedOffsetChipSelected,
                              ]}
                              onPress={() => {
                                setLinkedOffsetDays(preset);
                                setLinkedUseCustomOffset(false);
                              }}
                            >
                              <Text style={[
                                styles.linkedOffsetChipText,
                                !linkedUseCustomOffset && linkedOffsetDays === preset && styles.linkedOffsetChipTextSelected,
                              ]}>
                                {preset > 0 ? `+${preset}` : preset === 0 ? '0' : `${preset}`}
                              </Text>
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity
                            style={[styles.linkedOffsetChip, linkedUseCustomOffset && styles.linkedOffsetChipSelected]}
                            onPress={() => setLinkedUseCustomOffset(true)}
                          >
                            <Text style={[styles.linkedOffsetChipText, linkedUseCustomOffset && styles.linkedOffsetChipTextSelected]}>
                              Custom
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {linkedUseCustomOffset && (
                          <View style={styles.linkedCustomOffsetRow}>
                            <TextInput
                              style={[styles.input, { flex: 1, marginRight: 8 }]}
                              placeholder="e.g., 3 or -3"
                              placeholderTextColor="#999"
                              value={linkedCustomOffset}
                              onChangeText={setLinkedCustomOffset}
                              keyboardType="numbers-and-punctuation"
                            />
                            <Text style={styles.helperText}>days from parent end</Text>
                          </View>
                        )}
                        <Text style={styles.helperText}>
                          {linkedUseCustomOffset
                            ? (parseInt(linkedCustomOffset) > 0
                                ? `Linked activity starts ${linkedCustomOffset} day(s) after parent ends`
                                : parseInt(linkedCustomOffset) < 0
                                  ? `Linked activity starts ${Math.abs(parseInt(linkedCustomOffset))} day(s) before parent ends`
                                  : parseInt(linkedCustomOffset) === 0
                                    ? 'Linked activity starts on the same day parent ends'
                                    : 'Enter offset')
                            : (linkedOffsetDays > 0
                                ? `Linked activity starts ${linkedOffsetDays} day(s) after parent ends`
                                : linkedOffsetDays === 0
                                  ? 'Linked activity starts on the same day parent ends'
                                  : `Linked activity starts ${Math.abs(linkedOffsetDays)} day(s) before parent ends`)
                          }
                        </Text>
                      </View>

                      {/* Duration */}
                      <View style={styles.linkedActivityFormRow}>
                        <Text style={styles.linkedActivityFormLabel}>Duration (days) *</Text>
                        <View style={styles.durationStepper}>
                          <TouchableOpacity
                            style={styles.durationStepperBtn}
                            onPress={() => setLinkedDuration((d: string) => String(Math.max(1, (parseInt(d) || 1) - 1)))}
                          >
                            <Text style={styles.durationStepperBtnText}>−</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={styles.durationStepperInput}
                            value={linkedDuration}
                            onChangeText={v => setLinkedDuration(v.replace(/[^0-9]/g, ''))}
                            keyboardType="numeric"
                            textAlign="center"
                            selectTextOnFocus
                          />
                          <TouchableOpacity
                            style={styles.durationStepperBtn}
                            onPress={() => setLinkedDuration((d: string) => String((parseInt(d) || 0) + 1))}
                          >
                            <Text style={styles.durationStepperBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Floor Level for linked activity */}
                      <View style={styles.linkedActivityFormRow}>
                        <Text style={styles.linkedActivityFormLabel}>Floor Level *</Text>
                        <View style={styles.pickerContainer}>
                          {(timechart.floorLevels || []).map((floor) => (
                            <TouchableOpacity
                              key={floor.id}
                              style={[
                                styles.contractorOption,
                                linkedFloorLevelId === floor.id && styles.contractorOptionSelected,
                              ]}
                              onPress={() => setLinkedFloorLevelId(floor.id)}
                            >
                              <View style={[styles.contractorOptionColor, { backgroundColor: floor.color }]} />
                              <Text style={[
                                styles.contractorOptionText,
                                linkedFloorLevelId === floor.id && styles.contractorOptionTextSelected,
                              ]}>
                                {floor.name}
                              </Text>
                              {linkedFloorLevelId === floor.id && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Contractors for linked activity */}
                      <View style={styles.linkedActivityFormRow}>
                        <Text style={styles.linkedActivityFormLabel}>Contractors (optional)</Text>
                        <View style={styles.pickerContainer}>
                          {timechart.subcontractors.map((c) => {
                            const checked = linkedSubcontractorIds.includes(c.id);
                            return (
                              <TouchableOpacity
                                key={c.id}
                                style={styles.multiContractorRow}
                                activeOpacity={0.7}
                                onPress={() => setLinkedSubcontractorIds(prev =>
                                  checked ? prev.filter(id => id !== c.id) : [...prev, c.id]
                                )}
                              >
                                <View style={[styles.multiContractorCheckbox, checked && styles.multiContractorCheckboxChecked]}>
                                  {checked && <Text style={styles.multiContractorCheckmark}>✓</Text>}
                                </View>
                                <Text style={{ flex: 1, color: '#333', fontSize: 14 }}>{c.name}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      {/* Confirm / Cancel */}
                      <View style={styles.linkedActivityFormActions}>
                        <TouchableOpacity
                          style={styles.linkedActivityCancelBtn}
                          onPress={() => {
                            setAddingLinkedActivityIndex(null);
                            setLinkedName('');
                            setLinkedOffsetDays(1);
                            setLinkedCustomOffset('');
                            setLinkedUseCustomOffset(false);
                            setLinkedDuration('7');
                            setLinkedFloorLevelId('');
                            setLinkedSubcontractorIds([]);
                          }}
                        >
                          <Text style={styles.linkedActivityCancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.linkedActivityConfirmBtn}
                          onPress={() => {
                            if (!linkedName.trim()) {
                              Alert.alert('Error', 'Please enter a name for the linked activity');
                              return;
                            }
                            if (!linkedFloorLevelId) {
                              Alert.alert('Error', 'Please select a floor level for the linked activity');
                              return;
                            }
                            const offsetVal = linkedUseCustomOffset
                              ? (parseInt(linkedCustomOffset) || 1)
                              : linkedOffsetDays;
                            const durationVal = parseInt(linkedDuration) || 1;
                            const newEntry: LinkedActivityEntry = {
                              id: `linked-${Date.now()}-${Math.random()}`,
                              name: linkedName.trim(),
                              offsetDays: offsetVal,
                              duration: durationVal,
                              floorLevelId: linkedFloorLevelId,
                              subcontractorIds: linkedSubcontractorIds,
                            };
                            setLinkedActivities(prev => [...prev, newEntry]);
                            setAddingLinkedActivityIndex(null);
                            setLinkedName('');
                            setLinkedOffsetDays(1);
                            setLinkedCustomOffset('');
                            setLinkedUseCustomOffset(false);
                            setLinkedDuration('7');
                            setLinkedFloorLevelId('');
                            setLinkedSubcontractorIds([]);
                          }}
                        >
                          <Text style={styles.linkedActivityConfirmBtnText}>✓ Add Linked Activity</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addLinkedActivityBtn}
                      onPress={() => {
                        // Pre-fill floor from parent selection
                        setLinkedFloorLevelId(selectedFloorLevel || (timechart.floorLevels?.[0]?.id ?? ''));
                        setLinkedSubcontractorIds([...selectedSubcontractorIds]);
                        setAddingLinkedActivityIndex(linkedActivities.length);
                      }}
                    >
                      <Text style={styles.addLinkedActivityBtnText}>＋ Add Linked Activity</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                // EDIT MODE: Link to existing activities
                <View style={styles.formSection}>
                  <Text style={styles.label}>Link to Another Activity</Text>
                  <Text style={styles.helperText}>
                    ⚠️ Save this activity first, then use "Add Linkage" from the activity row to link it.
                  </Text>
                  <TouchableOpacity
                    style={[styles.addLinkedActivityBtn, { opacity: 0.5 }]}
                    disabled={true}
                  >
                    <Text style={styles.addLinkedActivityBtnText}>＋ Save Activity First</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* ──────────────────────────────────────────────────────────────── */}

              <View style={styles.divider} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floor Picker Modal — shown when editing a grouped row with multiple floors */}
      <Modal
        visible={showFloorPickerForEdit}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFloorPickerForEdit(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowFloorPickerForEdit(false)}>
                <Text style={styles.closeButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Floor to Edit</Text>
              <View style={{ width: 60 }} />
            </View>
            <ScrollView style={styles.formContainer}>
              <View style={styles.formSection}>
                <Text style={[styles.helperText, { marginBottom: 8 }]}>
                  This activity spans multiple floors. Choose the floor level you want to edit.
                </Text>
                {floorPickerActivities.map((act) => (
                  <TouchableOpacity
                    key={act.id}
                    style={[styles.contractorOption, { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }]}
                    onPress={() => {
                      setShowFloorPickerForEdit(false);
                      // Small delay so the floor picker closes before the edit modal opens
                      setTimeout(() => handleOpenEditActivity(act), 150);
                    }}
                  >
                    <View
                      style={[
                        styles.contractorOptionColor,
                        { backgroundColor: act.floorLevelColor, width: 18, height: 18, borderRadius: 9, marginRight: 10 },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contractorOptionText}>{act.floorLevelName || 'Unknown Floor'}</Text>
                      <Text style={[styles.helperText, { fontSize: 11 }]}>
                        {new Date(act.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' → '}
                        {new Date(act.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 18, color: '#666' }}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
              <TouchableOpacity onPress={() => { setContractorName(''); setEditingContractorId(null); setShowAddContractorModal(false); }}>
                <Text style={styles.closeButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Contractors</Text>
              <TouchableOpacity onPress={() => { setContractorName(''); setEditingContractorId(null); setShowAddContractorModal(false); }}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {/* Existing contractors list */}
              <View style={styles.formSection}>
                <Text style={styles.label}>
                  Added Contractors ({timechart.subcontractors.length})
                </Text>
                {timechart.subcontractors.length === 0 ? (
                  <View style={contractorModalStyles.emptyState}>
                    <Text style={contractorModalStyles.emptyStateText}>No contractors added yet</Text>
                  </View>
                ) : (
                  timechart.subcontractors.map((sub) => (
                    <View key={sub.id} style={[
                      contractorModalStyles.contractorRow,
                      editingContractorId === sub.id && contractorModalStyles.contractorRowEditing,
                    ]}>
                      <View style={contractorModalStyles.contractorDot} />
                      <Text style={contractorModalStyles.contractorRowName} numberOfLines={1}>
                        {sub.name}
                      </Text>
                      {/* Edit button */}
                      <TouchableOpacity
                        onPress={() => {
                          if (user && !canPerformAction(user.role, 'canEdit')) {
                            Alert.alert('Permission Denied', 'You do not have permission to edit contractors.');
                            return;
                          }
                          setEditingContractorId(sub.id);
                          setContractorName(sub.name);
                        }}
                        style={contractorModalStyles.editButton}
                      >
                        <Text style={contractorModalStyles.editButtonText}>✎</Text>
                      </TouchableOpacity>
                      {/* Remove button */}
                      <TouchableOpacity
                        onPress={() => {
                          if (user && !canPerformAction(user.role, 'canEdit')) {
                            Alert.alert('Permission Denied', 'You do not have permission to remove contractors.');
                            return;
                          }
                          Alert.alert(
                            'Remove Contractor',
                            `Remove "${sub.name}"? This will also remove all their activities.`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Remove', style: 'destructive', onPress: () => onRemoveSubcontractor(sub.id) },
                            ]
                          );
                        }}
                        style={contractorModalStyles.removeButton}
                      >
                        <Text style={contractorModalStyles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.divider} />

              {/* Add / Edit contractor */}
              <View style={styles.formSection}>
                <Text style={styles.label}>
                  {editingContractorId ? 'Edit Contractor Name' : 'Add New Contractor'}
                </Text>
                <View style={contractorModalStyles.inputRow}>
                  <TextInput
                    style={[styles.input, contractorModalStyles.nameInput]}
                    placeholder="e.g., ABC Construction Ltd."
                    placeholderTextColor="#999"
                    value={contractorName}
                    onChangeText={setContractorName}
                    onSubmitEditing={handleAddContractor}
                    returnKeyType="done"
                  />
                  {editingContractorId && (
                    <TouchableOpacity
                      style={contractorModalStyles.cancelEditButton}
                      onPress={() => { setEditingContractorId(null); setContractorName(''); }}
                    >
                      <Text style={contractorModalStyles.cancelEditButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={contractorModalStyles.addButton}
                    onPress={handleAddContractor}
                  >
                    <Text style={contractorModalStyles.addButtonText}>
                      {editingContractorId ? 'Save' : '+ Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {!editingContractorId && (
                  <Text style={contractorModalStyles.emptyStateText}>Type a name and tap "+ Add" — you can add as many as you need</Text>
                )}
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

      {/* Link Activity Modal - for linking existing activities */}
      <Modal
        visible={showLinkActivityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLinkActivityModal(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => {
                    Keyboard.dismiss();
                    setShowLinkActivityModal(false);
                  }}>
                    <Text style={styles.closeButton}>← Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Link Activity</Text>
                  <TouchableOpacity onPress={() => {
                    Keyboard.dismiss();
                    handleLinkActivities();
                  }}>
                    <Text style={styles.doneButton}>Done</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
                  {/* Select Target Activity */}
                  <View style={styles.formSection}>
                    <Text style={styles.label}>Link To Activity *</Text>
                    <Text style={styles.helperText}>
                      Select the activity you want to link this to. This activity will become a child/linked activity. You can link already-linked activities (hierarchical linking allowed).
                    </Text>
                    <View style={styles.pickerContainer}>
                      {timechart.activities
                        .filter(a => {
                          // Exclude source activity (self-linking not allowed)
                          if (a.id === linkingSourceActivityId) return false;
                          
                          // HIERARCHICAL LINKING: Allow any activity (including those with parents) to be a target
                          // This enables: Activity A → B → C (chain linking)
                          return true;
                        })
                        .map((activity) => (
                          <TouchableOpacity
                            key={activity.id}
                            style={[
                              styles.contractorOption,
                              selectedLinkTargetActivityId === activity.id && styles.contractorOptionSelected,
                            ]}
                            onPress={() => {
                              console.log('🔗 [LINK-MODAL] Target activity selected:', {
                                targetId: activity.id,
                                targetName: activity.name,
                                sourceId: linkingSourceActivityId,
                              });
                              setSelectedLinkTargetActivityId(activity.id);
                            }}
                          >
                            <View
                              style={[
                                styles.contractorOptionColor,
                                { backgroundColor: activity.floorLevelColor },
                              ]}
                            />
                            <Text
                              style={[
                                styles.contractorOptionText,
                                selectedLinkTargetActivityId === activity.id && styles.contractorOptionTextSelected,
                              ]}
                            >
                              {activity.name}
                            </Text>
                            {selectedLinkTargetActivityId === activity.id && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </TouchableOpacity>
                        ))}
                    </View>
                  </View>

                  {/* Select Offset */}
                  <View style={styles.formSection}>
                    <Text style={styles.label}>Offset (days) *</Text>
                    <Text style={styles.helperText}>
                      When should this linked activity start relative to the parent activity end?
                    </Text>
                    <View style={styles.linkedOffsetRow}>
                      {[-2, -1, 0, 1, 2].map(preset => (
                        <TouchableOpacity
                          key={preset}
                          style={[
                            styles.linkedOffsetChip,
                            !linkUseCustomOffset && linkOffsetDays === preset && styles.linkedOffsetChipSelected,
                          ]}
                          onPress={() => {
                            setLinkOffsetDays(preset);
                            setLinkUseCustomOffset(false);
                          }}
                        >
                          <Text style={[
                            styles.linkedOffsetChipText,
                            !linkUseCustomOffset && linkOffsetDays === preset && styles.linkedOffsetChipTextSelected,
                          ]}>
                            {preset > 0 ? `+${preset}` : preset === 0 ? '0' : `${preset}`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={[styles.linkedOffsetChip, linkUseCustomOffset && styles.linkedOffsetChipSelected]}
                        onPress={() => setLinkUseCustomOffset(true)}
                      >
                        <Text style={[styles.linkedOffsetChipText, linkUseCustomOffset && styles.linkedOffsetChipTextSelected]}>
                          Custom
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {linkUseCustomOffset && (
                      <View style={styles.linkedCustomOffsetRow}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="e.g., 3 or -3"
                          placeholderTextColor="#999"
                          value={linkCustomOffset}
                          onChangeText={setLinkCustomOffset}
                          keyboardType="numbers-and-punctuation"
                        />
                      </View>
                    )}
                    <Text style={styles.helperText}>
                      {linkUseCustomOffset
                        ? (parseInt(linkCustomOffset) > 0
                            ? `Linked activity starts ${linkCustomOffset} day(s) after parent ends`
                            : parseInt(linkCustomOffset) < 0
                              ? `Linked activity starts ${Math.abs(parseInt(linkCustomOffset))} day(s) before parent ends`
                              : parseInt(linkCustomOffset) === 0
                                ? 'Linked activity starts on the same day parent ends'
                                : 'Enter offset')
                        : (linkOffsetDays > 0
                            ? `Linked activity starts ${linkOffsetDays} day(s) after parent ends`
                            : linkOffsetDays === 0
                              ? 'Linked activity starts on the same day parent ends'
                              : `Linked activity starts ${Math.abs(linkOffsetDays)} day(s) before parent ends`)
                      }
                    </Text>
                  </View>

                  <View style={styles.divider} />
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
  editActivityText: {
    fontSize: 15,
    color: '#0066CC',
    fontWeight: 'bold',
    marginLeft: 4,
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
  subdividedActivityIndicatorDragging: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  subdividedActivityIndicatorBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
  },
  // Number badge for grouped cell count view
  groupCountBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  groupCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  // Toggle button for grouped cell view mode
  viewToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#0066CC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  viewToggleButtonText: {
    color: '#0066CC',
    fontSize: 12,
    fontWeight: '700',
  },
  // Floor filter bar
  floorFilterBar: {
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    maxHeight: 48,
  },
  floorFilterBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  floorFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CCC',
    backgroundColor: '#FFF',
    gap: 5,
  },
  floorFilterChipAll: {
    borderColor: '#0066CC',
    backgroundColor: '#0066CC',
  },
  floorFilterChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  floorFilterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  floorFilterChipTextActive: {
    color: '#FFF',
  },
  // Duration stepper control
  durationStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0066CC',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    minWidth: 160,
  },
  durationStepperBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationStepperBtnText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  durationStepperInput: {
    flex: 1,
    height: 44,
    fontSize: 18,
    fontWeight: '700',
    color: '#0066CC',
    textAlign: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 4,
  },
  mailNotificationBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    alignItems: 'flex-end',
  },
  mailNotificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  mailNotificationIcon: {
    fontSize: 16,
  },
  mailNotificationText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  inlineAddActivityRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  inlineAddActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#0066CC',
    backgroundColor: '#F0F8FF',
  },
  inlineAddActivityButtonText: {
    color: '#0066CC',
    fontSize: 13,
    fontWeight: '700',
  },
  inlineAddContractorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  inlineAddContractorInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  inlineAddContractorBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0066CC',
  },
  inlineAddContractorBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // Multi-contractor selection styles
  multiContractorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FAFAFA',
    marginBottom: 6,
    gap: 10,
  },
  multiContractorCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#0066CC',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  multiContractorCheckboxChecked: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  multiContractorCheckmark: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  selectedContractorsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F4E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    marginTop: 2,
  },
  selectedContractorsSummaryText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  selectedContractorsClear: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '600',
    paddingLeft: 12,
  },
  // ── Linked Activity Styles ──────────────────────────────────────────────────
  linkedActivityCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B3D4F5',
    marginBottom: 8,
    padding: 12,
  },
  linkedActivityCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  linkedActivityCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A3A5C',
    marginBottom: 2,
  },
  linkedActivityCardMeta: {
    fontSize: 12,
    color: '#5580A0',
  },
  linkedActivityCardRemove: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  linkedActivityCardRemoveText: {
    color: '#C62828',
    fontSize: 15,
    fontWeight: '700',
  },
  linkedActivityForm: {
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#B3D4F5',
    padding: 14,
    marginTop: 4,
  },
  linkedActivityFormTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0066CC',
    marginBottom: 12,
  },
  linkedActivityFormRow: {
    marginBottom: 12,
  },
  linkedActivityFormLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  linkedOffsetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  linkedOffsetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#B3D4F5',
    backgroundColor: '#F0F7FF',
  },
  linkedOffsetChipSelected: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  linkedOffsetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066CC',
  },
  linkedOffsetChipTextSelected: {
    color: '#FFF',
  },
  linkedCustomOffsetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  linkedActivityFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  linkedActivityCancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CCC',
    backgroundColor: '#FFF',
  },
  linkedActivityCancelBtnText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  linkedActivityConfirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0066CC',
  },
  linkedActivityConfirmBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  addLinkedActivityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0066CC',
    borderStyle: 'dashed',
    backgroundColor: '#F0F7FF',
    marginTop: 4,
  },
  addLinkedActivityBtnText: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '700',
  },
  // ── Linked Activity row in chart ────────────────────────────────────────────
  linkedActivityRow: {
    backgroundColor: '#F0F7FF',
    borderLeftWidth: 3,
    borderLeftColor: '#0066CC',
  },
  linkedActivityCellText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#1A3A5C',
    paddingLeft: 8,
  },
});
