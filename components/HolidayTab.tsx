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
import { PublicHoliday } from '../types';

interface HolidayTabProps {
  holidays: PublicHoliday[];
  onAddHoliday: (holiday: PublicHoliday) => void;
  onRemoveHoliday: (id: string) => void;
  startDate: Date;
  endDate: Date;
}

export const HolidayTab: React.FC<HolidayTabProps> = ({
  holidays,
  onAddHoliday,
  onRemoveHoliday,
  startDate,
  endDate,
}) => {
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddHoliday = () => {
    if (!holidayName.trim()) {
      Alert.alert('Error', 'Please enter a holiday name');
      return;
    }

    const date = new Date(holidayDate);
    if (date < startDate || date > endDate) {
      Alert.alert('Error', 'Holiday date must be within project timeline');
      return;
    }

    onAddHoliday({
      id: Math.random().toString(36).substr(2, 9),
      date,
      name: holidayName.trim(),
      color: '#FF6B6B',
    });

    setHolidayName('');
    setHolidayDate(new Date().toISOString().split('T')[0]);
  };

  const renderHolidayItem = ({ item }: { item: PublicHoliday }) => (
    <View style={styles.holidayItem}>
      <View style={styles.holidayInfo}>
        <Text style={styles.holidayName}>{item.name}</Text>
        <Text style={styles.holidayDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity onPress={() => onRemoveHoliday(item.id)}>
        <Text style={styles.deleteButton}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Public Holiday</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Holiday name (e.g., Christmas, New Year)"
          placeholderTextColor="#999"
          value={holidayName}
          onChangeText={setHolidayName}
        />

        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor="#999"
          value={holidayDate}
          onChangeText={setHolidayDate}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddHoliday}>
          <Text style={styles.addButtonText}>Add Holiday</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Holidays ({holidays.length})
        </Text>
        {holidays.length === 0 ? (
          <Text style={styles.emptyText}>No holidays added yet</Text>
        ) : (
          <FlatList
            data={holidays}
            renderItem={renderHolidayItem}
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
  holidayInfo: {
    flex: 1,
  },
  holidayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  holidayDate: {
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
