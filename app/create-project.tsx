import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TimeChartData } from '@/types';
import { saveTimechart } from '@/utils/storage';

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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  doneText: { fontSize: 14, fontWeight: '600', color: '#0066CC' },
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
    return (
      <View style={datePickerStyles.container}>
        <Text style={datePickerStyles.label}>{label}</Text>
        <View style={datePickerStyles.webWrapper}>
          <Text style={datePickerStyles.calendarIcon}>📅</Text>
          <Text style={[datePickerStyles.webLabel, !value && { color: '#999' }]}>
            {displayText}
          </Text>
          <Text style={datePickerStyles.chevron}>▼</Text>
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

export default function CreateProjectScreen() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogoUri, setCompanyLogoUri] = useState<string | null>(null);
  const [projectLocation, setProjectLocation] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [lookAheadDuration, setLookAheadDuration] = useState('13'); // Default: 13 weeks (~90 days)

  const handlePickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setCompanyLogoUri(result.assets[0].uri);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    if (!companyName.trim()) {
      Alert.alert('Error', 'Please enter a company name');
      return;
    }

    if (!projectLocation.trim()) {
      Alert.alert('Error', 'Please enter a project location');
      return;
    }

    const start = new Date(startDate);
    
    // Calculate end date from Look Ahead duration (in weeks)
    const durationWeeks = parseInt(lookAheadDuration) || 13;
    if (durationWeeks < 1) {
      Alert.alert('Error', 'Look Ahead duration must be at least 1 week');
      return;
    }
    if (durationWeeks > 52) {
      Alert.alert('Error', 'Look Ahead duration cannot exceed 52 weeks');
      return;
    }
    
    const end = new Date(start);
    end.setDate(end.getDate() + durationWeeks * 7);

    const newTimechart: TimeChartData = {
      id: Math.random().toString(36).substr(2, 9),
      projectName: projectName.trim(),
      companyName: companyName.trim(),
      companyLogoUri: companyLogoUri || undefined,
      projectLocation: projectLocation.trim(),
      projectDescription: projectDescription.trim() || undefined,
      startDate: start,
      endDate: end,
      nonWorkingDays: [],
      publicHolidays: [],
      subcontractors: [],
      floorLevels: [
        { id: '1', name: 'Ground Floor', levelNumber: 0, color: '#FF6B6B' },
        { id: '2', name: 'First Floor', levelNumber: 1, color: '#4ECDC4' },
        { id: '3', name: 'Second Floor', levelNumber: 2, color: '#45B7D1' },
      ],
      activities: [],
      dailyActivityLogs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await saveTimechart(newTimechart);
      router.push(`/editor?id=${newTimechart.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create project. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Project</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Project Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project name"
            placeholderTextColor="#999"
            value={projectName}
            onChangeText={setProjectName}
          />
          <Text style={styles.hint}>e.g., Downtown Office Tower, Shopping Mall</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Company Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter company name"
            placeholderTextColor="#999"
            value={companyName}
            onChangeText={setCompanyName}
          />
          <Text style={styles.hint}>e.g., ABC Construction Ltd.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Company / Builder Logo</Text>
          <TouchableOpacity style={styles.logoPickerButton} onPress={handlePickLogo}>
            {companyLogoUri ? (
              <Image source={{ uri: companyLogoUri }} style={styles.logoPreview} resizeMode="contain" />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderIcon}>🏢</Text>
                <Text style={styles.logoPlaceholderText}>Tap to upload logo</Text>
                <Text style={styles.logoPlaceholderHint}>Square image recommended</Text>
              </View>
            )}
          </TouchableOpacity>
          {companyLogoUri && (
            <TouchableOpacity onPress={() => setCompanyLogoUri(null)} style={styles.removeLogoButton}>
              <Text style={styles.removeLogoText}>✕ Remove logo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Project Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project location"
            placeholderTextColor="#999"
            value={projectLocation}
            onChangeText={setProjectLocation}
          />
          <Text style={styles.hint}>e.g., New York, NY or 123 Main Street, Boston</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Project Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional: Add description"
            placeholderTextColor="#999"
            value={projectDescription}
            onChangeText={setProjectDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <DatePickerField
            label="Start Date *"
            value={startDate}
            onChange={setStartDate}
            minDate={new Date()}
            maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Look Ahead Duration (weeks) *</Text>
          <View style={styles.durationContainer}>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setLookAheadDuration((d) => String(Math.max(1, parseInt(d || '1') - 1)))}
            >
              <Text style={styles.durationButtonText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.durationInput}
              value={lookAheadDuration}
              onChangeText={(val) => setLookAheadDuration(val.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              textAlign="center"
              selectTextOnFocus
            />
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => setLookAheadDuration((d) => String(Math.min(52, parseInt(d || '0') + 1)))}
            >
              <Text style={styles.durationButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.durationHint}>
            {(() => {
              const weeks = parseInt(lookAheadDuration) || 0;
              const days = weeks * 7;
              const startD = new Date(startDate);
              const endD = new Date(startD);
              endD.setDate(endD.getDate() + days);
              return `${weeks} weeks = ${days} days\nEnds: ${endD.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            })()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateProject}
        >
          <Text style={styles.createButtonText}>Create Project</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 40,
  },
  backButton: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  textArea: {
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  createButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoPickerButton: {
    borderWidth: 2,
    borderColor: '#0066CC',
    borderStyle: 'dashed',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F0F8FF',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPreview: {
    width: '100%',
    height: 160,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  logoPlaceholderIcon: {
    fontSize: 36,
  },
  logoPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  logoPlaceholderHint: {
    fontSize: 12,
    color: '#999',
  },
  removeLogoButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  removeLogoText: {
    fontSize: 12,
    color: '#CC0000',
    fontWeight: '600',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  durationButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '600',
  },
  durationInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1.5,
    borderColor: '#0066CC',
    fontWeight: '600',
  },
  durationHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    lineHeight: 18,
  },
});
