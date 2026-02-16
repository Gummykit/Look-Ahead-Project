import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Activity, Subcontractor } from '../types';
import { getDaysBetween } from '../utils/dateUtils';

interface ActivityTabProps {
  activities: Activity[];
  subcontractors: Subcontractor[];
  startDate: Date;
  endDate: Date;
  onAddActivity: (activity: Partial<Activity>) => void;
  onUpdateActivity: (id: string, activity: Partial<Activity>) => void;
  onRemoveActivity: (id: string) => void;
}

export const ActivityTab: React.FC<ActivityTabProps> = ({
  activities,
  subcontractors,
  startDate,
  endDate,
  onAddActivity,
  onUpdateActivity,
  onRemoveActivity,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [startActivityDate, setStartActivityDate] = useState(
    new Date(startDate).toISOString().split('T')[0]
  );
  const [endActivityDate, setEndActivityDate] = useState(
    new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<string | null>(
    subcontractors.length > 0 ? subcontractors[0].id : null
  );

  const handleAddActivity = () => {
    if (!activityName.trim()) {
      Alert.alert('Error', 'Please enter an activity name');
      return;
    }

    if (!selectedSubcontractor) {
      Alert.alert('Error', 'Please select a subcontractor');
      return;
    }

    const start = new Date(startActivityDate);
    const end = new Date(endActivityDate);

    if (start >= end) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    const subcontractor = subcontractors.find(s => s.id === selectedSubcontractor);
    if (!subcontractor) {
      Alert.alert('Error', 'Invalid subcontractor selected');
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
      color: subcontractor.color,
    });

    resetForm();
    setModalVisible(false);
  };

  const resetForm = () => {
    setActivityName('');
    setActivityDescription('');
    setStartActivityDate(new Date(startDate).toISOString().split('T')[0]);
    setEndActivityDate(
      new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    setSelectedSubcontractor(subcontractors.length > 0 ? subcontractors[0].id : null);
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <View style={styles.activityItem}>
      <View style={[styles.colorBar, { backgroundColor: item.color }]} />
      <View style={styles.activityInfo}>
        <Text style={styles.activityName}>{item.name}</Text>
        <Text style={styles.activitySubcontractor}>{item.subcontractorName}</Text>
        <Text style={styles.activityDates}>
          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
        </Text>
        <Text style={styles.activityDuration}>{item.duration} days</Text>
      </View>
      <TouchableOpacity onPress={() => onRemoveActivity(item.id)}>
        <Text style={styles.deleteButton}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Add Activity</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Activities ({activities.length})
        </Text>
        {activities.length === 0 ? (
          <Text style={styles.emptyText}>No activities added yet</Text>
        ) : (
          <FlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Activity</Text>
              <TouchableOpacity onPress={handleAddActivity}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formSection}>
                <Text style={styles.label}>Activity Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Excavation, Framing, Finishing"
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
                <Text style={styles.label}>Start Date *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                  value={startActivityDate}
                  onChangeText={setStartActivityDate}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>End Date *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                  value={endActivityDate}
                  onChangeText={setEndActivityDate}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Subcontractor *</Text>
                <View style={styles.pickerContainer}>
                  {subcontractors.length === 0 ? (
                    <Text style={styles.noSubcontractorText}>
                      Please add subcontractors first
                    </Text>
                  ) : (
                    subcontractors.map(contractor => (
                      <TouchableOpacity
                        key={contractor.id}
                        style={[
                          styles.contractorOption,
                          selectedSubcontractor === contractor.id && styles.contractorOptionSelected,
                        ]}
                        onPress={() => setSelectedSubcontractor(contractor.id)}
                      >
                        <View
                          style={[
                            styles.contractorOptionColor,
                            { backgroundColor: contractor.color },
                          ]}
                        />
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

              <View style={styles.divider} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0066CC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  activityItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    borderLeftWidth: 4,
  },
  colorBar: {
    width: 4,
    marginRight: 12,
    borderRadius: 2,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activitySubcontractor: {
    fontSize: 12,
    color: '#0066CC',
    marginTop: 2,
    fontWeight: '500',
  },
  activityDates: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activityDuration: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  deleteButton: {
    fontSize: 20,
    color: '#FF4444',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#999',
    fontSize: 13,
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
});
