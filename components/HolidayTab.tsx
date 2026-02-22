import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { NonWorkingDay } from '../types';

interface NonWorkingDayTabProps {
  nonWorkingDays: NonWorkingDay[];
  onAddNonWorkingDay: (day: NonWorkingDay) => void;
  onRemoveNonWorkingDay: (id: string) => void;
  startDate: Date;
  endDate: Date;
}

export const HolidayTab: React.FC<NonWorkingDayTabProps> = ({
  nonWorkingDays,
  onAddNonWorkingDay,
  onRemoveNonWorkingDay,
  startDate,
  endDate,
}) => {
  const [nonWorkingDayName, setNonWorkingDayName] = useState('');
  const [nonWorkingDayDate, setNonWorkingDayDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddNonWorkingDay = () => {
    if (!nonWorkingDayName.trim()) {
      Alert.alert('Error', 'Please enter a non-working day name');
      return;
    }

    const date = new Date(nonWorkingDayDate);
    if (date < startDate || date > endDate) {
      Alert.alert('Error', 'Non-working day date must be within project timeline');
      return;
    }

    onAddNonWorkingDay({
      id: Math.random().toString(36).substr(2, 9),
      date,
      name: nonWorkingDayName.trim(),
      color: '#FF6B6B',
    });

    setNonWorkingDayName('');
    setNonWorkingDayDate(new Date().toISOString().split('T')[0]);
  };

  const renderNonWorkingDayItem = ({ item }: { item: NonWorkingDay }) => (
    <View style={styles.nonWorkingDayItem}>
      <View style={styles.nonWorkingDayInfo}>
        <Text style={styles.nonWorkingDayName}>{item.name}</Text>
        <Text style={styles.nonWorkingDayDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity onPress={() => onRemoveNonWorkingDay(item.id)}>
        <Text style={styles.deleteButton}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Non-Working Day</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Non-working day name (e.g., Christmas, New Year)"
          placeholderTextColor="#999"
          value={nonWorkingDayName}
          onChangeText={setNonWorkingDayName}
        />

        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor="#999"
          value={nonWorkingDayDate}
          onChangeText={setNonWorkingDayDate}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddNonWorkingDay}>
          <Text style={styles.addButtonText}>Add Non-Working Day</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Non-Working Days ({nonWorkingDays.length})
        </Text>
        {nonWorkingDays.length === 0 ? (
          <Text style={styles.emptyText}>No non-working days added yet</Text>
        ) : (
          <FlatList
            data={nonWorkingDays}
            renderItem={renderNonWorkingDayItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
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
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  holidayItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  nonWorkingDayItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  holidayInfo: {
    flex: 1,
  },
  nonWorkingDayInfo: {
    flex: 1,
  },
  holidayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  nonWorkingDayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  holidayDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  nonWorkingDayDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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
});
