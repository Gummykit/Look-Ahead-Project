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
import { Subcontractor } from '../types';

interface SubcontractorTabProps {
  subcontractors: Subcontractor[];
  onAddSubcontractor: (name: string) => void;
  onRemoveSubcontractor: (id: string) => void;
}

export const SubcontractorTab: React.FC<SubcontractorTabProps> = ({
  subcontractors,
  onAddSubcontractor,
  onRemoveSubcontractor,
}) => {
  const [subcontractorName, setSubcontractorName] = useState('');

  const handleAddSubcontractor = () => {
    if (!subcontractorName.trim()) {
      Alert.alert('Error', 'Please enter a subcontractor name');
      return;
    }

    onAddSubcontractor(subcontractorName.trim());
    setSubcontractorName('');
  };

  const renderSubcontractorItem = ({ item }: { item: Subcontractor }) => (
    <View style={styles.contractorItem}>
      <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
      <View style={styles.contractorInfo}>
        <Text style={styles.contractorName}>{item.name}</Text>
        <Text style={styles.contractorStatus}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <TouchableOpacity onPress={() => onRemoveSubcontractor(item.id)}>
        <Text style={styles.deleteButton}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Subcontractor</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Subcontractor name (e.g., ABC Construction, XYZ Contractors)"
          placeholderTextColor="#999"
          value={subcontractorName}
          onChangeText={setSubcontractorName}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddSubcontractor}>
          <Text style={styles.addButtonText}>Add Subcontractor</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Subcontractors ({subcontractors.length})
        </Text>
        <Text style={styles.hint}>
          Assign subcontractors to activities in the Activities tab
        </Text>
        {subcontractors.length === 0 ? (
          <Text style={styles.emptyText}>No subcontractors added yet</Text>
        ) : (
          <FlatList
            data={subcontractors}
            renderItem={renderSubcontractorItem}
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
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
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
  contractorItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  contractorInfo: {
    flex: 1,
  },
  contractorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  contractorStatus: {
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
